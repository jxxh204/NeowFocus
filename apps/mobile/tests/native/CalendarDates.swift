import Foundation
import EventKit

@main
struct CalendarDatesTests {
  static func main() {
    let originalTimeZone = NSTimeZone.default
    defer { NSTimeZone.default = originalTimeZone }
    let store = EKEventStore()
    let cases: [(String, Int, Int, Int, Int)] = [
      ("Asia/Seoul", 2026, 10, 23, 24),
      ("Asia/Seoul", 2026, 10, 31, 24),
      ("Asia/Seoul", 2026, 12, 31, 24),
      ("Asia/Seoul", 2028, 2, 29, 24),
      ("America/Los_Angeles", 2026, 3, 8, 23),
      ("America/Los_Angeles", 2026, 11, 1, 25)
    ]
    for (zone, year, month, day, hours) in cases {
      NSTimeZone.default = TimeZone(identifier: zone)!
      var calendar = Calendar(identifier: .gregorian)
      calendar.timeZone = NSTimeZone.default
      let start = calendar.date(from: DateComponents(year: year, month: month, day: day))!
      let nextDayStart = calendar.date(byAdding: .day, value: 1, to: start)!
      let dates = FocusCalendarEventDates(start: start, nextDayStart: nextDayStart)
      precondition(nextDayStart.timeIntervalSince(start) == Double(hours * 3600))
      precondition(calendar.isDate(dates.end, inSameDayAs: start))

      // Reproduce the old setter sequence on real, unsaved EventKit objects.
      // No calendar access, permission request, or save is performed by this test.
      let event = EKEvent(eventStore: store)
      for _ in 0..<2 {
        event.startDate = start
        event.endDate = nextDayStart
        event.isAllDay = true
      }
      precondition(event.endDate >= nextDayStart, "Fixture must reproduce the two-day bug")
      precondition(!dates.matches(event))
      dates.apply(to: event)
      precondition(dates.matches(event), "Existing two-day event must be repaired")

      let fresh = EKEvent(eventStore: store)
      precondition(!dates.matches(fresh))
      dates.apply(to: fresh)
      precondition(dates.matches(fresh), "New event must span exactly one civil day")
      for pass in 1...20 {
        // Changed summary metadata takes the update path even when dates match.
        fresh.title = "냐우포커스 · \(pass)회"
        dates.apply(to: fresh)
        precondition(dates.matches(fresh), "Repeated updates must not expand dates")
        precondition(calendar.isDate(fresh.endDate, inSameDayAs: start))
      }
      // An unchanged summary now passes the date guard, avoiding another save.
      precondition(dates.matches(fresh))
      print("PASS: \(zone) \(year)-\(month)-\(day) (\(hours)h): repair, creation, 20 updates, stable date guard")
    }
    print("PASS: 6 civil-day cases using production date setters and real EventKit; no calendar reads or writes")
  }
}
