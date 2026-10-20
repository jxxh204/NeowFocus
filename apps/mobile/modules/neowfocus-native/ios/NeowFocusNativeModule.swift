import ExpoModulesCore
import Foundation
import ActivityKit
import WidgetKit
import UIKit
import AudioToolbox
import UserNotifications

public class NeowFocusNativeModule: Module {
  private let cloud = FocusCloudStore()
  private var cloudObserver: NSObjectProtocol?
  public func definition() -> ModuleDefinition {
    Name("NeowFocusNative")
    Events("cloudChanged")
    OnCreate {
      self.cloudObserver = NotificationCenter.default.addObserver(forName: .neowFocusCloudChanged, object: nil, queue: .main) { [weak self] _ in
        self?.sendEvent("cloudChanged", [:])
      }
    }
    OnDestroy {
      if let observer = self.cloudObserver { NotificationCenter.default.removeObserver(observer) }
    }
    AsyncFunction("cloudSubscribe") { () async throws in
      try await self.cloud.subscribe()
      await MainActor.run { UIApplication.shared.registerForRemoteNotifications() }
    }
    AsyncFunction("playCompletionFeedback") { () async in
      let notificationSettings = await UNUserNotificationCenter.current().notificationSettings()
      let soundAllowed = notificationSettings.authorizationStatus != .denied
        && (notificationSettings.authorizationStatus == .notDetermined || notificationSettings.soundSetting == .enabled)
      await MainActor.run {
        // Foreground feedback. Background completion uses the scheduled notification.
        UIImpactFeedbackGenerator(style: .soft).impactOccurred(intensity: 0.65)
        if soundAllowed { AudioServicesPlaySystemSound(1104) }
      }
    }
    Function("getCapabilities") { () -> [String: Bool] in
      ["widgets": FocusStore.directory != nil, "liveActivities": ActivityAuthorizationInfo().areActivitiesEnabled, "cloudKit": Bundle.main.object(forInfoDictionaryKey: "NeowFocusCloudEnabled") as? Bool ?? false]
    }
    AsyncFunction("publishSnapshot") { (json: String) async throws in
      guard let data = json.data(using: .utf8) else { return }
      let next = try JSONDecoder().decode(FocusSnapshot.self, from: data)
      _ = try FocusStore.publish(next)
      WidgetCenter.shared.reloadAllTimelines()
      let foreground = await MainActor.run { UIApplication.shared.applicationState == .active }
      try await FocusEffects.shared.reconcile(mayStart: foreground, notifications: false)
    }
    AsyncFunction("readSnapshot") { () throws -> [String: Any] in
      try Self.dictionary(FocusStore.read())
    }
    AsyncFunction("drainCommands") { () throws -> [[String: Any]] in
      let commands = try FocusStore.transaction { $0.commands }
      return try commands.map { try Self.dictionary($0) }
    }
    AsyncFunction("acknowledgeCommands") { (ids: [String]) throws in
      try FocusStore.transaction { $0.commands.removeAll { ids.contains($0.id) } }
    }
    AsyncFunction("cloudAccountStatus") { () async throws -> String in try await self.cloud.accountStatus() }
    AsyncFunction("cloudRead") { () async throws -> [String: Any?] in try await self.cloud.read() }
    AsyncFunction("cloudWrite") { (json: String, expectedTag: String?) async throws -> String in
      let tag = try await self.cloud.write(json, expectedTag: expectedTag)
      try? FocusStore.transaction { if $0.commands.isEmpty { $0.syncPending = false } }
      WidgetCenter.shared.reloadAllTimelines()
      return tag
    }
  }
  private static func dictionary<T: Encodable>(_ value: T) throws -> [String: Any] {
    try JSONSerialization.jsonObject(with: JSONEncoder().encode(value)) as? [String: Any] ?? [:]
  }
}
