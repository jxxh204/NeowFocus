# NeowFocus 0.1.1 (16) — TestFlight

Source: `6468977cac28e7349231ea9d406018cadd166612`; calendar fix: `ad78d65`.

This build fixes daily focus summaries expanding to two days after repeated EventKit updates. Day queries retain their exclusive next-midnight boundary; EventKit writes and comparisons use the last second of the intended civil day. Existing owned focus events are corrected during the next successful calendar reconciliation. Desktop and Neow Calendar source are unchanged.

Validation: the native regression test runs the production date helpers against real unsaved EventKit objects on iOS 27.0. Six cases cover creation, repair of the reproduced two-day bug, 20 repeated updates, month/year boundaries, leap day, and 23/25-hour DST days. Mobile TypeScript checks, timer-style checks, all 84 core tests and the iOS Release Simulator build passed. See [date-fix evidence](../../../implementation/focus-calendar-evidence/single-day-fix-2026-10-24.md).

Actual iCloud calendar writes, cross-device propagation and physical-device installation are not verified by those tests. Existing remote events will only be corrected after installation of this build and successful authorized sync.

The distribution archive succeeded and passed strict deep signature verification, the Screen Time-free scan, app/widget and embedded Expo config version checks, approved pixel-cat byte verification, and native date-helper metadata/debug-info checks. Executable and dSYM UUIDs match (`E1432C9F-826D-3A8D-BD05-1FD2578141EC`). The JS bytecode hash matches build 15, as expected for this native-only functional fix.

The upload attempt at **2026-10-24 15:19 KST** failed before submission: Xcode returned exit 70, `exportArchive Failed to Use Accounts`, requiring App Store Connect access for team `L67FAG9382`. The web session also expired. Xcode account and web login recovery were requested. **This build has not been uploaded.** Apple processing, group assignment and tester access are unverified. No public App Store submission was performed.

After authentication recovery, resume from `apps/mobile` without rebuilding:

```sh
bash scripts/upload-testflight.sh build-output/NeowFocus-0.1.1-16.xcarchive build-output/TestFlight-0.1.1-16
```

- Archive: `apps/mobile/build-output/NeowFocus-0.1.1-16.xcarchive`
- Build log: `apps/mobile/build-output/archive-0.1.1-16.log`
- Upload log: `apps/mobile/build-output/upload-0.1.1-16.log`
- [Korean test notes, prepared locally](what-to-test-ko.txt)
- [Release status](release-status.json)
- [Archive audit](archive-audit.json)
- [Screen Time-free audit](screen-time-audit.json)
