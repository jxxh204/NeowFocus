# NeowFocus 0.1.1 (14) — TestFlight

Uploaded on 2026-10-23 at 02:34:53 KST with Xcode, exit 0, `Upload succeeded` and `EXPORT SUCCEEDED`. The authenticated App Store Connect upload row confirms **0.1.1 (14)**, Apple build `575023ac-3c53-48b4-92b1-c713519c32bb`. Apple processing completed. The authenticated build detail confirms the existing **더기와 쟈니들** internal group is attached with **2 testers**. Korean test notes show **저장 완료**.

Source: `a7127b8` (feature commit `3755fc7`). This build pins the finished timer's style, retains selected water/blocks, includes the existing optional CloudKit task/history restoration, and adds default-off daily iCloud calendar summaries. The dedicated calendar is **냐우포커스**; daily all-day entries contain focus count and actual total time, without task names. The companion Neow Calendar **1.0.0 (10)** shows those marked summaries alongside its explicitly selected calendar.

Validation: mobile TypeScript, timer migration/geometry/render branch checks, **84 core tests**, actual archive app/widget and Expo config versions, EventKit linkage, calendar permission purpose strings, CloudKit/App Group entitlements, native UserDefaults privacy reason CA92.1, strict deep signing and Screen Time-free scan all passed. Approved pixel cat bytes remain unchanged. Actual release Hermes contains the calendar bridge, opt-in preference and completion appearance logic.

Prior local native Simulator evidence is in `docs/implementation/focus-calendar-evidence/`: a natural 1-minute water completion stayed water and the day deep link opened the record sheet. These checks are distinct from actual iPhone installation, real Apple account CloudKit/EventKit round trips and cross-app propagation, which remain unverified.

Xcode reported non-blocking missing dSYMs for React.framework, ReactNativeDependencies.framework and hermesvm.framework; framework crash symbolication may be limited. No public App Store submission was performed.

- [Release status](release-status.json)
- [Archive audit](archive-audit.json)
- [Screen Time-free audit](screen-time-audit.json)
- [Feature and approved pixel asset audit](feature-audit.json)
- [Saved test notes](what-to-test-ko.txt)
- [Internal group evidence](testflight-internal.png)
- [Companion Calendar internal group evidence](neow-calendar-testflight-internal.png)
- [App Store Connect build](https://appstoreconnect.apple.com/teams/e5ec510c-eb5f-47f1-99e1-31e2ce1e77cc/apps/6751244958/testflight/ios/575023ac-3c53-48b4-92b1-c713519c32bb)

Archive: `apps/mobile/build-output/NeowFocus-0.1.1-14.xcarchive`. Upload log: `apps/mobile/build-output/upload-0.1.1-14.log`. The companion Calendar source and its release evidence are preserved in `neow-calendar-build10-source.patch` (commits ebfaddb, 76b9141 and 025bb58), because that checkout is under `/private/tmp`.
