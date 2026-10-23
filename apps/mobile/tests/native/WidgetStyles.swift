import Foundation

@main
struct WidgetStylesTests {
  static func main() throws {
    for raw in [nil, "future", ""] as [String?] { precondition(FocusTimerStyle(saved: raw) == .classic) }
    for style in FocusTimerStyle.allCases { precondition(FocusTimerStyle(saved: style.rawValue) == style) }
    precondition(FocusStyleGeometry.progress(status: "idle", duration: 60, remaining: 0) == 0)
    precondition(FocusStyleGeometry.progress(status: "completed", duration: 60, remaining: 60) == 1)
    precondition(FocusStyleGeometry.progress(status: "paused", duration: 60, remaining: 45) == 0.25)
    precondition(FocusStyleGeometry.progress(status: "running", duration: 60, remaining: 30) == 0.5)
    for invalid in [Double.nan, .infinity, -.infinity, 0, -1] {
      precondition(FocusStyleGeometry.progress(status: "running", duration: invalid, remaining: 30) == 0)
    }
    precondition(FocusStyleGeometry.blockCount(.nan) == 0)
    precondition(FocusStyleGeometry.blockCount(-1) == 0)
    precondition(FocusStyleGeometry.blockCount(2) == 24)
    var occupied = Set<String>()
    for (index, piece) in FocusStyleGeometry.pieces.enumerated() {
      precondition(piece.cells.count == 4)
      let top = piece.cells.map { $0.1 }.min()!
      for drop in -8...0 {
        for cell in piece.cells {
          precondition(!occupied.contains("\(cell.0),\(cell.1 + drop)"), "piece \(index) intersects on descent")
        }
      }
      for cell in piece.cells {
        precondition((0..<12).contains(cell.0) && (0..<8).contains(cell.1))
        precondition(occupied.insert("\(cell.0),\(cell.1)").inserted)
      }
      precondition(FocusStyleGeometry.blockCount(Double(index + 1) / 24) == index + 1)
      precondition(top >= 0)
    }
    precondition(occupied.count == 96)
    // Upgrade compatibility: old app-group and ActivityKit payloads have no style keys.
    let old = """
    {"sessionId":"qa","task":"Widget QA","status":"running","endsAt":100000,"remainingSeconds":60,"durationSeconds":60,"revision":1,"updatedAt":40000,"showTaskOnLockScreen":false}
    """
    var snapshot = try JSONDecoder().decode(FocusSnapshot.self, from: Data(old.utf8))
    precondition(snapshot.timerStyle == nil && snapshot.showRemainingTime == nil)
    snapshot.timerStyle = "water"; snapshot.showRemainingTime = true
    let restored = try JSONDecoder().decode(FocusSnapshot.self, from: JSONEncoder().encode(snapshot))
    precondition(restored.timerStyle == "water" && restored.showRemainingTime == true)
    let completed = restored.normalized(at: Date(timeIntervalSince1970: 101))
    precondition(completed.status == "completed" && completed.timerStyle == "water" && completed.showRemainingTime == true)
    var paused = restored; paused.status = "paused"; paused.endsAt = nil; paused.remainingSeconds = 30
    precondition(paused.remaining(at: Date(timeIntervalSince1970: 999)) == 30 && paused.timerStyle == "water")
    print("PASS: legacy snapshots, round trips, completion/pause style, safe progress, 24 droppable pieces and 96-cell exact cover")
  }
}
