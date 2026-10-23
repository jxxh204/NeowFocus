import SwiftUI
import WidgetKit
import ImageIO
import UniformTypeIdentifiers

@main
struct WidgetViewSnapshots {
  @MainActor static func save<V: View>(_ view: V, _ name: String, width: CGFloat, height: CGFloat) {
    let renderer = ImageRenderer(content: view.frame(width: width, height: height).background(Color(white: 0.153)))
    renderer.scale = 3
    guard let image = renderer.cgImage else { fatalError("View rendering unavailable") }
    let directory = URL(fileURLWithPath: CommandLine.arguments[1])
    let file = directory.appendingPathComponent("\(name).png")
    let destination = CGImageDestinationCreateWithURL(file as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, image, nil); precondition(CGImageDestinationFinalize(destination))
  }
  @MainActor static func main() {
    let now = Date.now
    for style in FocusTimerStyle.allCases {
      var snapshot = FocusSnapshot(sessionId: "component-qa", task: "지금 할 일 하나에 집중하기", status: "running", endsAt: now.addingTimeInterval(750).timeIntervalSince1970 * 1000, remainingSeconds: 750, durationSeconds: 1500, revision: 1, updatedAt: now.timeIntervalSince1970 * 1000, showTaskOnLockScreen: false)
      snapshot.timerStyle = style.rawValue; snapshot.showRemainingTime = true
      let entry = FocusEntry(date: now, snapshot: snapshot)
      save(FocusWidgetContent(entry: entry, family: .systemSmall), "small-\(style.rawValue)", width: 126, height: 126)
      save(FocusWidgetContent(entry: entry, family: .systemMedium), "medium-\(style.rawValue)", width: 306, height: 126)
      save(FocusLiveCard(snapshot: snapshot), "live-\(style.rawValue)", width: 370, height: 110)
      save(FocusWidgetContent(entry: entry, family: .systemSmall).environment(\.dynamicTypeSize, .accessibility3), "large-text-\(style.rawValue)", width: 126, height: 126)
      snapshot.status = "paused"; snapshot.endsAt = nil
      save(FocusWidgetContent(entry: FocusEntry(date: now, snapshot: snapshot), family: .systemSmall), "paused-small-\(style.rawValue)", width: 126, height: 126)
      save(FocusLiveCard(snapshot: snapshot), "paused-\(style.rawValue)", width: 370, height: 110)
      snapshot.status = "completed"; snapshot.remainingSeconds = 0
      save(FocusLiveCard(snapshot: snapshot), "completed-\(style.rawValue)", width: 370, height: 110)
    }
    print("Rendered actual widget/card views offscreen in iOS; host delivery and gestures still require an unlocked Mac.")
  }
}
