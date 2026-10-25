# NeowFocus 0.1.1 (16) — TestFlight

Source: `6468977cac28e7349231ea9d406018cadd166612`; calendar fix: `ad78d65`.

This build fixes daily focus summaries expanding to two days after repeated EventKit updates. Day queries retain their exclusive next-midnight boundary; EventKit writes and comparisons use the last second of the intended civil day. Existing owned focus events are corrected during the next successful calendar reconciliation. Desktop and Neow Calendar source are unchanged.

Validation: the native regression test runs the production date helpers against real unsaved EventKit objects on iOS 27.0. Six cases cover creation, repair of the reproduced two-day bug, 20 repeated updates, month/year boundaries, leap day, and 23/25-hour DST days. Mobile TypeScript checks, timer-style checks, all 84 core tests and the iOS Release Simulator build passed. See [date-fix evidence](../../../implementation/focus-calendar-evidence/single-day-fix-2026-10-24.md).

Actual iCloud calendar writes, cross-device propagation and physical-device installation are not verified by those tests. Existing remote events will only be corrected after installation of this build and successful authorized sync.

The distribution archive succeeded and passed strict deep signature verification, the Screen Time-free scan, app/widget and embedded Expo config version checks, approved pixel-cat byte verification, and native date-helper metadata/debug-info checks. Executable and dSYM UUIDs match (`E1432C9F-826D-3A8D-BD05-1FD2578141EC`). The JS bytecode hash matches build 15, as expected for this native-only functional fix.

Uploaded successfully through **Xcode Organizer on 2026-10-25 at 21:28 KST**. Organizer shows `Uploaded to Apple` for **0.1.1 (16)**, and App Store Connect confirms build `5b23116c-9e56-424b-a496-ee46e2d5d86d` has **completed processing**. The existing internal group **더기와 쟈니들 (2 testers)** still has **automatic Xcode build distribution** enabled. Build 16 is connected to that existing internal group, providing access to its two testers. Korean test notes were saved and the page confirmed `저장 완료`. Physical installation of build 16 and real-account event repair remain unverified.

The command-line retry on October 25 still failed with account access error (exit 70), but the authenticated Organizer upload succeeded without rebuilding. The October 24 authentication blocker is resolved for this upload. Existing non-blocking dSYM warnings remain for React.framework, ReactNativeDependencies.framework and hermesvm.framework. No public App Store submission was performed.

- Archive: `apps/mobile/build-output/NeowFocus-0.1.1-16.xcarchive`
- Build log: `apps/mobile/build-output/archive-0.1.1-16.log`
- Failed CLI retry log: `apps/mobile/build-output/upload-0.1.1-16-retry-20261025.log`
- [Organizer upload status](uploaded-build16-organizer.png)
- [Upload completion and symbol warnings](upload-complete-organizer.png)
- [App Store Connect processing](testflight-processing.png)
- [Saved Korean test notes](what-to-test-ko.txt)
- [Release status](release-status.json)
- [Archive audit](archive-audit.json)
- [Screen Time-free audit](screen-time-audit.json)

- [TestFlight ready, group and saved notes](testflight-ready.png)
- [Existing group automatic distribution](internal-group-automatic.png)
