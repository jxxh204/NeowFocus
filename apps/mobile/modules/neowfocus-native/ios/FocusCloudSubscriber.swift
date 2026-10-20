import ExpoModulesCore
import CloudKit
import UIKit
import WidgetKit

extension Notification.Name {
  static let neowFocusCloudChanged = Notification.Name("NeowFocusCloudChanged")
}

public class FocusCloudSubscriber: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    guard let notification = CKNotification(fromRemoteNotificationDictionary: userInfo), notification.subscriptionID == "focus-state-changes-v1", FocusStore.read().syncEnabled == true else {
      completionHandler(.noData); return
    }
    Task {
      do {
        let foreground = await MainActor.run { application.applicationState == .active }
        if !foreground { try await Self.refreshExistingActivity() }
        await MainActor.run { NotificationCenter.default.post(name: .neowFocusCloudChanged, object: nil) }
        completionHandler(.newData)
      } catch { completionHandler(.failed) }
    }
  }

  // Background pushes are best effort. Never start a new Activity here, nor
  // replace the JS store: it performs the full conflict merge on next foreground.
  private static func refreshExistingActivity() async throws {
    let remote = try await FocusCloudStore().read()
    guard let json = remote["json"] as? String, let data = json.data(using: .utf8),
      let envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any],
      envelope["schemaVersion"] as? Int == 1,
      let state = envelope["state"] as? [String: Any],
      let session = state["current"] as? [String: Any],
      let id = session["id"] as? String,
      let revision = session["revision"] as? Int,
      let updated = session["updatedAt"] as? Double,
      let status = session["status"] as? String,
      ["running", "paused", "finished"].contains(status),
      let task = session["task"] as? String,
      let duration = session["plannedMs"] as? Double,
      let remaining = session["remainingMs"] as? Double else { return }
    let changed = try FocusStore.transaction { local -> Bool in
      guard local.snapshot.syncEnabled == true, local.commands.isEmpty,
        local.syncPending != true, local.snapshot.sessionId == id,
        revision >= local.snapshot.revision, updated >= local.snapshot.updatedAt else { return false }
      if let conflicts = state["conflicts"] as? [[String: Any]], !conflicts.isEmpty { return false }
      local.snapshot.task = task
      local.snapshot.status = status == "finished" ? "completed" : status
      local.snapshot.endsAt = session["endsAt"] as? Double
      local.snapshot.remainingSeconds = remaining / 1000
      local.snapshot.durationSeconds = duration / 1000
      local.snapshot.revision = revision
      local.snapshot.updatedAt = updated
      local.snapshot.sharedStateJSON = json
      return true
    }
    if changed {
      try await FocusEffects.shared.reconcile(mayStart: false, notifications: true)
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
