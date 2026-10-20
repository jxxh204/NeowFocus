import SwiftUI
import WidgetKit
import ActivityKit
import AppIntents

struct FocusEntry: TimelineEntry {
  var date: Date
  var snapshot: FocusSnapshot
  var syncPending: Bool = false
}
struct FocusTimeline: TimelineProvider {
  func placeholder(in context: Context) -> FocusEntry { FocusEntry(date: .now, snapshot: .empty) }
  func getSnapshot(in context: Context, completion: @escaping (FocusEntry) -> Void) { completion(FocusEntry(date: .now, snapshot: FocusStore.read().normalized())) }
  func getTimeline(in context: Context, completion: @escaping (Timeline<FocusEntry>) -> Void) {
    let snapshot = FocusStore.read()
    let syncPending = (try? FocusStore.transaction { $0.syncPending ?? false }) ?? false
    let now = Date.now
    var entries = [FocusEntry(date: now, snapshot: snapshot.normalized(at: now), syncPending: syncPending)]
    // The system owns timeline delivery; Live Activity gauges advance independently.
    if snapshot.status == "running", let end = snapshot.endsAt {
      let endDate = Date(timeIntervalSince1970: end/1000)
      if endDate > now {
        for offset in stride(from: 60.0, to: min(endDate.timeIntervalSince(now), 86400), by: 60) {
          let date = now.addingTimeInterval(offset)
          entries.append(FocusEntry(date: date, snapshot: snapshot.normalized(at: date), syncPending: syncPending))
        }
        entries.append(FocusEntry(date: endDate, snapshot: snapshot.normalized(at: endDate), syncPending: syncPending))
      }
    }
    if let midnight = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: now)) {
      entries.append(FocusEntry(date: midnight, snapshot: snapshot.normalized(at: midnight), syncPending: syncPending))
      entries.sort { $0.date < $1.date }
    }
    completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(900))))
  }
}

struct FocusClock: View {
  var snapshot: FocusSnapshot
  var date: Date = .now
  var diameter: CGFloat = 76
  var liveProgress: Bool = false
  var stroke: Color { snapshot.status == "paused" ? Color(white: 0.55) : .white }
  var lineWidth: CGFloat { min(7, diameter * 0.1) }
  var body: some View {
    VStack(spacing: 5) {
      ZStack {
        if liveProgress && snapshot.status == "running", let end = snapshot.endsAt {
          let endDate = Date(timeIntervalSince1970: end / 1000)
          // The system advances this timer even while the app is suspended.
          // Date.now-based Shape.trim is only a snapshot in a Live Activity.
          ProgressView(timerInterval: endDate.addingTimeInterval(-max(1, snapshot.durationSeconds))...endDate,
                       countsDown: true, label: { EmptyView() }, currentValueLabel: { EmptyView() })
            .progressViewStyle(.circular).tint(.white)
        } else {
        Circle().stroke(.white.opacity(0.13), lineWidth: lineWidth)
        Circle().trim(from: 0, to: min(1, max(0, (snapshot.status == "idle" ? 1 : snapshot.remaining(at: date) / max(1, snapshot.durationSeconds)))))
          .stroke(stroke, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)).rotationEffect(.degrees(-90))
        if snapshot.status == "completed" { FocusPawShape().fill(.white).frame(width: diameter*0.34, height: diameter*0.35) }
        else {
          Capsule().fill(stroke).frame(width: min(6, diameter * 0.08), height: diameter*0.26).offset(y: -diameter*0.13)
            .rotationEffect(.degrees((1 - snapshot.remaining(at: date)/max(1,snapshot.durationSeconds))*360))
        }
        }
      }.frame(width: diameter, height: diameter).accessibilityHidden(true)
    }
  }
}
@available(iOS 17.0, *)
struct FocusControlIntent: AppIntent {
  static var title: LocalizedStringResource = "집중 멈춤·재개"
  static var openAppWhenRun = false
  @Parameter(title: "동작") var action: String
  @Parameter(title: "집중") var sessionId: String
  @Parameter(title: "버전") var revision: Int
  init() { action = "pause"; sessionId = ""; revision = -1 }
  init(action: String, sessionId: String, revision: Int) { self.action = action; self.sessionId = sessionId; self.revision = revision }
  func perform() async throws -> some IntentResult {
    guard let state = try FocusStore.command(action, expectedSessionId: sessionId, expectedRevision: revision) else {
      WidgetCenter.shared.reloadAllTimelines()
      return .result()
    }
    try await FocusEffects.shared.reconcile(mayStart: false, notifications: true)
    WidgetCenter.shared.reloadAllTimelines()
    if state.syncEnabled == true {
      let commands = try FocusStore.transaction { $0.commands }
      do {
        try await FocusCloudStore().publishCommands(snapshot: state, commands: commands)
        let sentIDs = Set(commands.map(\.id))
        try FocusStore.transaction { $0.syncPending = $0.commands.contains { !sentIDs.contains($0.id) } }
      } catch { try? FocusStore.transaction { $0.syncPending = true } }
      WidgetCenter.shared.reloadAllTimelines()
    }
    return .result()
  }
}

struct FocusWidgetView: View {
  @Environment(\.widgetFamily) var family
  var entry: FocusEntry
  var snapshot: FocusSnapshot {
    var value = entry.snapshot
    if value.status == "idle" {
      value.durationSeconds = (value.suggestionEligible == true ? 5 : value.defaultMinutes ?? 25) * 60
      value.remainingSeconds = value.durationSeconds
    }
    return value
  }
  var suggestsFirst: Bool { snapshot.status == "idle" && snapshot.suggestionEligible == true }
  var destination: URL? { URL(string: suggestsFirst ? "neowfocus:///?prepare=first-task" : "neowfocus://") }
  var todayCount: Int {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    let day = formatter.string(from: entry.date)
    let savedCount = snapshot.todayDay == day ? snapshot.todayCount ?? 0 : 0
    // Timeline normalization can observe an expired focus before JS writes its record.
    if snapshot.status == "completed", let end = snapshot.endsAt,
       formatter.string(from: Date(timeIntervalSince1970: end / 1000)) == day {
      if let json = snapshot.sharedStateJSON, let data = json.data(using: .utf8),
         let envelope = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
         let state = envelope["state"] as? [String: Any], let records = state["records"] as? [[String: Any]],
         records.contains(where: { $0["id"] as? String == snapshot.sessionId }) { return savedCount }
      return savedCount + 1
    }
    return savedCount
  }
  var body: some View {
    if snapshot.status == "idle" || snapshot.status == "completed" {
      VStack(spacing: 10) {
        FocusPawShape().fill(.white).frame(width: 38, height: 39)
        Text("오늘 \(todayCount)번의 집중").font(.system(size: family == .systemSmall ? 13 : 16, weight: .medium))
        Text(suggestsFirst ? "오늘 할 일 생각해보기" : "열어서 시작").font(.system(size: 11)).foregroundStyle(.secondary)
      }.frame(maxWidth: .infinity).foregroundStyle(.white).widgetURL(destination)
    } else {
      HStack(spacing: 16) {
        if family == .systemMedium {
          VStack(alignment: .leading, spacing: 10) {
            FocusCat(focused: snapshot.status == "running").frame(width: 26, height: 26)
            Text(snapshot.task).font(.system(size: 15, weight: .medium)).lineLimit(2)
            if #available(iOS 17.0, *) {
              Button(intent: FocusControlIntent(action: snapshot.status == "running" ? "pause" : "resume", sessionId: snapshot.sessionId ?? "", revision: snapshot.revision)) {
                Label(snapshot.status == "running" ? "멈춤" : "계속", systemImage: snapshot.status == "running" ? "pause.fill" : "play.fill").font(.system(size: 12))
              }.buttonStyle(.plain).padding(.vertical, 6)
            }
          }.frame(maxWidth: .infinity, alignment: .leading)
        }
        VStack(spacing: 8) {
          if family == .systemSmall { FocusCat(focused: snapshot.status == "running").frame(width: 22, height: 22) }
          FocusClock(snapshot: snapshot, date: entry.date, diameter: family == .systemSmall ? 70 : 82)
        }.frame(maxWidth: family == .systemSmall ? .infinity : nil)
      }.foregroundStyle(.white).padding(2).widgetURL(destination)
    }
  }
}

struct FocusHomeWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "NeowFocusWidget", provider: FocusTimeline()) { entry in
      if #available(iOS 17.0, *) { FocusWidgetView(entry: entry).containerBackground(Color(white: 0.153), for: .widget) }
      else { FocusWidgetView(entry: entry).padding(14).background(Color(white: 0.153)) }
    }.configurationDisplayName("집중").description("지금 하던 집중을 이어가요.").supportedFamilies([.systemSmall, .systemMedium])
  }
}

private func liveDisplay(_ original: FocusSnapshot, stale: Bool) -> FocusSnapshot {
  var snapshot = original.normalized()
  if stale && snapshot.status == "running" { snapshot.status = "completed"; snapshot.remainingSeconds = 0 }
  return snapshot
}

struct FocusLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: FocusActivityAttributes.self) { context in
      let snapshot = liveDisplay(context.state, stale: context.isStale)
      HStack(spacing: 14) {
        FocusCat(focused: snapshot.status == "running").frame(width: 30, height: 30)
        VStack(alignment: .leading, spacing: 4) {
          Text(snapshot.status == "completed" ? "집중 완료" : snapshot.status == "paused" ? "잠시 멈춤" : "집중 중").font(.system(size: 15, weight: .semibold)).foregroundStyle(.white)
          if snapshot.showTaskOnLockScreen { Text(snapshot.task).font(.system(size: 14)).foregroundStyle(Color(white: 0.88)).lineLimit(2) }
        }
        Spacer(minLength: 8)
        FocusClock(snapshot: snapshot, diameter: 48, liveProgress: true).frame(width: 70)
      }.foregroundStyle(.white).padding(18).background(Color(white: 0.153)).activityBackgroundTint(Color(white: 0.153)).activitySystemActionForegroundColor(.white).widgetURL(URL(string: "neowfocus://"))
    } dynamicIsland: { context in
      let snapshot = liveDisplay(context.state, stale: context.isStale)
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) { FocusCat(focused: snapshot.status == "running").frame(width: 28,height: 28) }
        DynamicIslandExpandedRegion(.trailing) { FocusClock(snapshot: snapshot, diameter: 36, liveProgress: true).foregroundStyle(.white) }
        DynamicIslandExpandedRegion(.bottom) { Text(snapshot.showTaskOnLockScreen ? snapshot.task : "지금 하던 집중 그대로").font(.caption).foregroundStyle(.white).lineLimit(1) }
      } compactLeading: { FocusCat(focused: snapshot.status == "running").frame(width: 20,height: 20) }
      compactTrailing: { FocusClock(snapshot: snapshot, diameter: 18, liveProgress: true).foregroundStyle(.white) }
      minimal: { FocusCat(focused: snapshot.status == "running").frame(width: 20,height: 20) }
      .widgetURL(URL(string: "neowfocus://"))
    }
  }
}

@main
struct NeowFocusWidgetBundle: WidgetBundle {
  var body: some Widget { FocusHomeWidget(); FocusLiveActivity() }
}
