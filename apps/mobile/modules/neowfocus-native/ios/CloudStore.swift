import Foundation
import CloudKit

actor FocusCloudStore {
  // Local focus can launch without initializing an unused iCloud connection.
  private lazy var database = CKContainer(identifier: "iCloud.com.neowfocus.pomodorotimer").privateCloudDatabase
  private let recordID = CKRecord.ID(recordName: "focus-state-v1")
  func subscribe() async throws {
    let subscription = CKQuerySubscription(recordType: "NeowFocusState", predicate: NSPredicate(value: true), subscriptionID: "focus-state-changes-v1", options: [.firesOnRecordCreation, .firesOnRecordUpdate, .firesOnRecordDeletion])
    let info = CKSubscription.NotificationInfo()
    info.shouldSendContentAvailable = true
    subscription.notificationInfo = info
    _ = try await database.save(subscription)
  }
  func accountStatus() async throws -> String {
    switch try await CKContainer(identifier: "iCloud.com.neowfocus.pomodorotimer").accountStatus() {
    case .available: return "available"
    case .noAccount: return "noAccount"
    case .restricted: return "restricted"
    case .temporarilyUnavailable: return "temporarilyUnavailable"
    default: return "couldNotDetermine"
    }
  }
  func read() async throws -> [String: Any?] {
    do {
      let record = try await database.record(for: recordID)
      return ["json": record["json"] as? String, "changeTag": record.recordChangeTag]
    } catch let error as CKError where error.code == .unknownItem {
      return ["json": nil, "changeTag": nil]
    }
  }
  func write(_ json: String, expectedTag: String?) async throws -> String {
    // A bounded document avoids CloudKit's per-record size limit; never truncate records.
    guard json.utf8.count < 900_000 else { throw failure("Cloud state exceeds 900 KB; archive history before syncing.") }
    var record: CKRecord
    do {
      record = try await database.record(for: recordID)
      guard let expectedTag, record.recordChangeTag == expectedTag else { throw failure("CLOUD_CONFLICT") }
    } catch let error as CKError where error.code == .unknownItem {
      guard expectedTag == nil else { throw failure("CLOUD_CONFLICT") }
      record = CKRecord(recordType: "NeowFocusState", recordID: recordID)
    }
    record["json"] = json as CKRecordValue
    do {
      let result = try await database.modifyRecords(saving: [record], deleting: [], savePolicy: .ifServerRecordUnchanged, atomically: true)
      guard let save = result.saveResults[recordID] else { throw failure("Missing CloudKit save result") }
      let saved = try save.get()
      guard let tag = saved.recordChangeTag else { throw failure("Missing CloudKit change tag") }
      return tag
    } catch let error as CKError where error.code == .serverRecordChanged {
      throw failure("CLOUD_CONFLICT")
    }
  }
  func publishCommands(snapshot: FocusSnapshot, commands: [FocusCommand]) async throws {
    guard snapshot.syncEnabled == true, let deviceId = snapshot.deviceId, !commands.isEmpty else { return }
    for attempt in 0..<3 {
      guard FocusStore.read().syncEnabled == true else { return }
      let remote = try await read()
      let remoteJSON = remote["json"] as? String
      guard let json = remoteJSON ?? snapshot.sharedStateJSON, let data = json.data(using: .utf8),
        var envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any],
        envelope["schemaVersion"] as? Int == 1,
        var state = envelope["state"] as? [String: Any] else { throw failure("Unsupported sync envelope") }
      guard state["records"] is [[String: Any]], state["current"] is NSNull || state["current"] is [String: Any] else { throw failure("Invalid sync state") }
      if let supplied = state["nativeCommands"], !(supplied is [[String: Any]]) { throw failure("Invalid native command history") }
      var existing = state["nativeCommands"] as? [[String: Any]] ?? []
      for command in commands where !existing.contains(where: { $0["id"] as? String == command.id }) {
        guard let baseJSON = command.baseSessionJSON, let baseData = baseJSON.data(using: .utf8),
          let base = try JSONSerialization.jsonObject(with: baseData) as? [String: Any] else { throw failure("Missing widget command base") }
        existing.append(["id": command.id, "sessionId": command.sessionId, "action": command.action,
          "issuedAt": command.issuedAt, "revision": command.revision, "deviceId": deviceId, "baseSession": base])
      }
      state["nativeCommands"] = existing
      envelope["state"] = state
      let next = String(decoding: try JSONSerialization.data(withJSONObject: envelope), as: UTF8.self)
      guard FocusStore.read().syncEnabled == true else { return }
      do { _ = try await write(next, expectedTag: remote["changeTag"] as? String); return }
      catch { if attempt == 2 || !error.localizedDescription.contains("CLOUD_CONFLICT") { throw error } }
    }
  }
  private func failure(_ text: String) -> NSError { NSError(domain: "NeowFocusCloud", code: 1, userInfo: [NSLocalizedDescriptionKey: text]) }
}
