import Foundation
import EventKit
import CoreGraphics

struct FocusCalendarDay: Decodable {
  let day: String
  let count: Int
  let focusedMs: Double
  let title: String
}

struct FocusCalendarEventDates {
  let start: Date
  let nextDayStart: Date

  // EventKit normalizes an all-day end to the final second of its civil day.
  // Assigning the following midnight to an already all-day event includes that
  // following day as well. Keep the exclusive query bound separate from writes.
  var end: Date { nextDayStart.addingTimeInterval(-1) }

  func matches(_ event: EKEvent) -> Bool {
    event.isAllDay && event.startDate == start && event.endDate == end
  }

  func apply(to event: EKEvent) {
    event.isAllDay = true
    event.startDate = start
    event.endDate = end
  }
}

/// Only the dedicated calendar and exact NeowFocus day URLs are ever mutated.
actor FocusCalendarStore {
  static let shared = FocusCalendarStore()
  private let store = EKEventStore()
  private let calendarTitle = "냐우포커스"
  private let calendarKey = "neowfocus.calendar.identifier.v1"

  private var authorized: Bool {
    if #available(iOS 17.0, *) { return EKEventStore.authorizationStatus(for: .event) == .fullAccess }
    return EKEventStore.authorizationStatus(for: .event) == .authorized
  }

  func connect() async throws {
    if !authorized {
      let granted = try await Self.requestAccess()
      guard granted else { throw failure("설정 → NeowFocus → 캘린더에서 전체 접근을 허용해 주세요.") }
    }
    store.reset()
    _ = try cloudSource()
  }

  @MainActor private static func requestAccess() async throws -> Bool {
    let permissionStore = EKEventStore()
    if #available(iOS 17.0, *) { return try await permissionStore.requestFullAccessToEvents() }
    return try await permissionStore.requestAccess(to: .event)
  }

  private func cloudSource() throws -> EKSource {
    guard authorized else { throw failure("캘린더 전체 접근을 허용해 주세요.") }
    // Never silently fall back to Google, Exchange or a device-only calendar.
    let sources = store.sources.filter { $0.sourceType == .calDAV && $0.title.caseInsensitiveCompare("iCloud") == .orderedSame }
    guard sources.count == 1, let source = sources.first else {
      throw failure("iPhone 설정 → Apple 계정 → iCloud에서 캘린더 동기화를 켜 주세요. iCloud 캘린더를 확인한 뒤 다시 시도해 주세요.")
    }
    return source
  }

  private func calendar(_ days: [(FocusCalendarDay, Date, Date)]) throws -> EKCalendar {
    let source = try cloudSource()
    let candidates = store.calendars(for: .event).filter {
      $0.source.sourceIdentifier == source.sourceIdentifier && $0.title == calendarTitle && $0.allowsContentModifications
    }
    if let saved = UserDefaults.standard.string(forKey: calendarKey),
      let existing = candidates.first(where: { $0.calendarIdentifier == saved }) { return existing }
    // A matching title alone is not ownership: it might be someone's shared calendar.
    // Another device's dedicated calendar can be identified by one of our day URLs.
    for candidate in candidates {
      for (summary, start, end) in days.reversed() {
        let marker = URL(string: "neowfocus://daily/\(summary.day)")
        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: [candidate])
        if store.events(matching: predicate).contains(where: { $0.url == marker && !$0.hasRecurrenceRules }) {
          UserDefaults.standard.set(candidate.calendarIdentifier, forKey: calendarKey)
          return candidate
        }
      }
    }
    let calendar = EKCalendar(for: .event, eventStore: store)
    calendar.title = calendarTitle
    calendar.source = source
    calendar.cgColor = CGColor(red: 0.36, green: 0.53, blue: 0.48, alpha: 1)
    try store.saveCalendar(calendar, commit: true)
    UserDefaults.standard.set(calendar.calendarIdentifier, forKey: calendarKey)
    return calendar
  }

  func reconcile(_ json: String) throws {
    guard let data = json.data(using: .utf8) else { throw failure("집중 합계를 읽지 못했어요.") }
    let summaries = try JSONDecoder().decode([FocusCalendarDay].self, from: data)
    var calendarSystem = Calendar(identifier: .gregorian)
    calendarSystem.timeZone = .current
    // Validate every day before any mutation, including civil dates and duplicate keys.
    var seen = Set<String>()
    let days = try summaries.map { summary -> (FocusCalendarDay, Date, Date) in
      let parts = summary.day.split(separator: "-").compactMap { Int($0) }
      guard summary.day.range(of: #"^\d{4}-\d{2}-\d{2}$"#, options: .regularExpression) != nil,
        parts.count == 3, seen.insert(summary.day).inserted,
        summary.count >= 0, summary.count <= 1_000_000,
        summary.focusedMs.isFinite, summary.focusedMs >= 0, summary.focusedMs <= 1e15,
        let start = calendarSystem.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2])),
        calendarSystem.component(.year, from: start) == parts[0],
        calendarSystem.component(.month, from: start) == parts[1],
        calendarSystem.component(.day, from: start) == parts[2],
        let end = calendarSystem.date(byAdding: .day, value: 1, to: start)
      else { throw failure("집중 합계의 날짜나 시간이 올바르지 않아요.") }
      return (summary, start, end)
    }
    store.reset()
    let calendar = try calendar(days)
    // EventKit can deliver two calendars after simultaneous first-time setup on
    // offline devices. Reconcile only owned URLs across those dedicated calendars.
    let dedicated = store.calendars(for: .event).filter {
      $0.source.sourceIdentifier == calendar.source.sourceIdentifier && $0.title == calendarTitle && $0.allowsContentModifications
    }
    do {
      for (summary, start, end) in days {
        guard authorized else { throw failure("캘린더 접근 권한을 확인해 주세요.") }
        let marker = URL(string: "neowfocus://daily/\(summary.day)")!
        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: dedicated)
        let owned = store.events(matching: predicate).filter { $0.url == marker && !$0.hasRecurrenceRules }
          .sorted { ($0.calendarItemExternalIdentifier ?? $0.calendarItemIdentifier) < ($1.calendarItemExternalIdentifier ?? $1.calendarItemIdentifier) }
        if summary.count == 0 {
          for event in owned { try store.remove(event, span: .thisEvent, commit: false) }
          continue
        }
        let event = owned.first ?? EKEvent(eventStore: store)
        let dates = FocusCalendarEventDates(start: start, nextDayStart: end)
        let notes = "NeowFocus의 하루 집중 기록\n\(summary.count)회 · 총 \(Int(summary.focusedMs / 1000))초\n집중한 실제 시간만 합산하며, 작업 이름은 공유하지 않습니다."
        if event.calendar == nil || event.title != summary.title || event.notes != notes || !dates.matches(event) {
          if event.calendar == nil { event.calendar = calendar }
          event.title = summary.title
          event.notes = notes
          dates.apply(to: event)
          event.availability = .free
          event.url = marker
          try store.save(event, span: .thisEvent, commit: false)
        }
        // Two offline devices can briefly create the same day. Converge once EventKit has received both.
        for duplicate in owned.dropFirst() { try store.remove(duplicate, span: .thisEvent, commit: false) }
      }
      try store.commit()
    } catch {
      store.reset()
      throw error
    }
  }

  private func failure(_ message: String) -> NSError {
    NSError(domain: "NeowFocusCalendar", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
  }
}
