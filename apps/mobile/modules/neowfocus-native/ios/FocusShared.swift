import Foundation
import ActivityKit
import UserNotifications
import Darwin

struct FocusSnapshot: Codable, Hashable {
  var sessionId: String?
  var task: String
  var status: String
  var endsAt: Double?
  var remainingSeconds: Double
  var durationSeconds: Double
  var revision: Int
  var updatedAt: Double
  var showTaskOnLockScreen: Bool
  var notifyOnCompletion: Bool? = nil
  var sharedStateJSON: String? = nil
  var syncEnabled: Bool? = nil
  var deviceId: String? = nil
  var suggestionEligible: Bool? = nil
  var defaultMinutes: Double? = nil
  var todayDay: String? = nil
  var todayCount: Int? = nil
  var todayFocusedSeconds: Double? = nil
  // Optional for snapshots written by installations before timer-style widgets.
  var timerStyle: String? = nil
  var showRemainingTime: Bool? = nil

  static let empty = FocusSnapshot(sessionId: nil, task: "", status: "idle", endsAt: nil, remainingSeconds: 0, durationSeconds: 1500, revision: 0, updatedAt: 0, showTaskOnLockScreen: false)
  func remaining(at date: Date = .now) -> Double {
    status == "running" ? max(0, ((endsAt ?? date.timeIntervalSince1970 * 1000) / 1000) - date.timeIntervalSince1970) : remainingSeconds
  }
  func normalized(at date: Date = .now) -> FocusSnapshot {
    var value = self
    if status == "running", remaining(at: date) <= 0 {
      value.status = "completed"
      value.remainingSeconds = 0
    }
    return value
  }
}

struct FocusCommand: Codable {
  var id: String
  var action: String
  var sessionId: String
  var issuedAt: Double
  var revision: Int
  var snapshot: FocusSnapshot
  var baseSessionJSON: String? = nil
}

struct FocusSharedState: Codable {
  var snapshot: FocusSnapshot = .empty
  var commands: [FocusCommand] = []
  var syncPending: Bool? = nil
}

// This source is compiled into the app pod and the widget extension.
// A file lock serializes AppIntent writes against foreground JS publication.
enum FocusStore {
  static let group = "group.com.neowfocus.pomodorotimer"
  static var directory: URL? { FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) }
  static func transaction<T>(_ body: (inout FocusSharedState) throws -> T) throws -> T {
    guard let directory else { throw NSError(domain: "NeowFocus", code: 1, userInfo: [NSLocalizedDescriptionKey: "App Group unavailable. Check the signed provisioning profile."]) }
    let fd = open(directory.appendingPathComponent("focus.lock").path, O_CREAT | O_RDWR, 0o600)
    guard fd >= 0 else { throw NSError(domain: "NeowFocus", code: 2) }
    defer { flock(fd, LOCK_UN); close(fd) }
    guard flock(fd, LOCK_EX) == 0 else { throw NSError(domain: "NeowFocus", code: 3) }
    let file = directory.appendingPathComponent("focus.json")
    var state: FocusSharedState
    if let data = try? Data(contentsOf: file) {
      state = try JSONDecoder().decode(FocusSharedState.self, from: data)
    } else { state = FocusSharedState() }
    let result = try body(&state)
    try JSONEncoder().encode(state).write(to: file, options: .atomic)
    return result
  }
  static func read() -> FocusSnapshot { (try? transaction { $0.snapshot }) ?? .empty }
  static func publish(_ next: FocusSnapshot) throws -> FocusSnapshot {
    try transaction { state in
      // Unacknowledged native changes must be replayed before JS can overwrite them.
      if !state.commands.isEmpty {
        // Preferences (especially disconnect and lock-screen privacy) take effect
        // immediately even while the focus command queue awaits JS persistence.
        state.snapshot.syncEnabled = next.syncEnabled
        state.snapshot.showTaskOnLockScreen = next.showTaskOnLockScreen
        state.snapshot.notifyOnCompletion = next.notifyOnCompletion
        state.snapshot.timerStyle = next.timerStyle
        state.snapshot.showRemainingTime = next.showRemainingTime
        state.snapshot.todayDay = next.todayDay
        state.snapshot.todayCount = next.todayCount
        state.snapshot.todayFocusedSeconds = next.todayFocusedSeconds
        if next.syncEnabled != true { state.syncPending = false }
        return state.snapshot
      }
      state.snapshot = next
      return next
    }
  }
  static func baseSessionJSON(_ snapshot: FocusSnapshot) -> String? {
    guard let json = snapshot.sharedStateJSON, let data = json.data(using: .utf8),
      let envelope = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let state = envelope["state"] as? [String: Any], var current = state["current"] as? [String: Any],
      current["id"] as? String == snapshot.sessionId else { return nil }
    current["status"] = snapshot.status
    current["endsAt"] = snapshot.endsAt.map { $0 as Any } ?? NSNull()
    current["remainingMs"] = snapshot.remainingSeconds * 1000
    current["revision"] = snapshot.revision
    current["updatedAt"] = snapshot.updatedAt
    if let device = snapshot.deviceId { current["updatedBy"] = device }
    guard let data = try? JSONSerialization.data(withJSONObject: current) else { return nil }
    return String(data: data, encoding: .utf8)
  }
  static func command(_ action: String, expectedSessionId: String, expectedRevision: Int) throws -> FocusSnapshot? {
    try transaction { state -> FocusSnapshot? in
      var value = state.snapshot.normalized()
      guard let id = value.sessionId, id == expectedSessionId, value.revision == expectedRevision else { return nil }
      let baseJSON = baseSessionJSON(value)
      let now = Date.now.timeIntervalSince1970 * 1000
      if action == "pause", value.status == "running" {
        value.remainingSeconds = value.remaining()
        value.endsAt = nil
        value.status = "paused"
      } else if action == "resume", value.status == "paused", value.remainingSeconds > 0 {
        value.endsAt = now + value.remainingSeconds * 1000
        value.status = "running"
      } else { return nil }
      value.revision += 1
      value.updatedAt = now
      state.snapshot = value
      var commandSnapshot = value
      commandSnapshot.sharedStateJSON = nil
      state.commands.append(FocusCommand(id: UUID().uuidString, action: action, sessionId: id, issuedAt: now, revision: value.revision, snapshot: commandSnapshot, baseSessionJSON: baseJSON))
      if value.syncEnabled == true { state.syncPending = true }
      return value
    }
  }
}

@available(iOS 16.2, *)
struct FocusActivityAttributes: ActivityAttributes {
  public typealias ContentState = FocusSnapshot
  var sessionId: String
}

@available(iOS 16.2, *)
enum FocusActivity {
  static func update(_ snapshot: FocusSnapshot, mayStart: Bool) async throws {
    let activities = Activity<FocusActivityAttributes>.activities
    for activity in activities where activity.attributes.sessionId != snapshot.sessionId {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
    let current = activities.first { $0.attributes.sessionId == snapshot.sessionId }
    let stale = snapshot.endsAt.map { Date(timeIntervalSince1970: $0 / 1000) }
    // ActivityKit content has a small payload budget; sync history stays in the app group.
    var activityState = snapshot
    activityState.sharedStateJSON = nil
    activityState.syncEnabled = nil
    activityState.deviceId = nil
    activityState.notifyOnCompletion = nil
    activityState.suggestionEligible = nil
    activityState.defaultMinutes = nil
    let content = ActivityContent(state: activityState, staleDate: stale)
    if snapshot.status == "idle" {
      for activity in activities { await activity.end(nil, dismissalPolicy: .immediate) }
    } else if snapshot.status == "completed" {
      await current?.end(content, dismissalPolicy: .after(.now.addingTimeInterval(300)))
    } else if let current {
      await current.update(content)
    } else if mayStart, let id = snapshot.sessionId, ActivityAuthorizationInfo().areActivitiesEnabled {
      _ = try Activity.request(attributes: FocusActivityAttributes(sessionId: id), content: content, pushType: nil)
    }
  }
}

// Same session identifier as the Expo completion notification. Widget controls
// must move/cancel that alarm even when the React tree is suspended.
enum FocusNotifications {
  static func reconcile(_ snapshot: FocusSnapshot) async throws {
    guard let id = snapshot.sessionId else { return }
    let center = UNUserNotificationCenter.current()
    center.removePendingNotificationRequests(withIdentifiers: [id])
    guard snapshot.notifyOnCompletion == true, snapshot.status == "running", snapshot.remaining() > 0 else { return }
    let content = UNMutableNotificationContent()
    content.title = "집중을 마쳤어요"
    content.body = snapshot.showTaskOnLockScreen ? snapshot.task : "수고했어요."
    content.sound = .default
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: max(1, snapshot.remaining()), repeats: false)
    try await center.add(UNNotificationRequest(identifier: id, content: content, trigger: trigger))
  }
}


// Queue operations inside each process. Re-read after every suspension point so
// a rapid pause/resume cannot leave an older Activity as the final UI.
actor FocusEffects {
  static let shared = FocusEffects()
  private var tail: Task<Void, Error>?

  func reconcile(mayStart: Bool, notifications: Bool) async throws {
    let previous = tail
    let task = Task {
      _ = try? await previous?.value
      for _ in 0..<4 {
        let before = FocusStore.read()
        if notifications { try await FocusNotifications.reconcile(before) }
        let activityState = FocusStore.read()
        try await FocusActivity.update(activityState, mayStart: mayStart)
        let after = FocusStore.read()
        if before == after && activityState == after { return }
      }
      // Every mutation also queues a reconciliation. In sustained interaction
      // the newest queued task observes the final persisted snapshot.
    }
    tail = task
    try await task.value
  }
}
