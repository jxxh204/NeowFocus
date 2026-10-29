# NeowFocus 0.1.1 (15) — TestFlight

Uploaded at **2026-10-23 16:12:49 KST**. Xcode exited 0 with `Upload succeeded` / `EXPORT SUCCEEDED`; the authenticated App Store Connect upload row confirms build 15 is processing. Apple processing and tester availability are not yet confirmed in this record. The build-detail test-notes field remains disabled and shows zero attached groups during processing. The existing internal group **더기와 쟈니들 (2 testers)** has automatic Xcode build distribution enabled; no new group was created.

Source: `0ef4186` (widget style implementation `d6b6685`, duck-boat removal `e44a5c7`). The existing timer-style and remaining-time preferences now apply to the home widget, Lock Screen Live Activity and Dynamic Island. Water retains its two wave layers without the duck boat. Completion retains the active style and the existing paw. Desktop is unchanged.

Validation: TypeScript, timer-style checks and 84 core tests passed. The distribution archive contains app/widget **0.1.1 (15)**, the matching embedded Expo config, the native integration markers and the approved pixel cat bytes. Strict deep signature verification and the Screen Time-free scan passed. Actual iOS Simulator host validation and its limits are recorded in [widget style evidence](../../../implementation/widget-style-evidence/README.md). This is not a physical-device test, cross-account iCloud test or continuous background-animation claim.

Xcode reported the existing non-blocking missing dSYM warnings for React.framework, ReactNativeDependencies.framework and hermesvm.framework. Framework crash symbolication can be limited. No public App Store submission was performed.

- [Release status](release-status.json)
- [Archive audit](archive-audit.json)
- [Screen Time-free audit](screen-time-audit.json)
- [Korean test notes, prepared locally; remote field remains disabled during processing](what-to-test-ko.txt)
- [App Store Connect processing evidence](testflight-processing.png)

Archive: `apps/mobile/build-output/NeowFocus-0.1.1-15.xcarchive`. Build log: `apps/mobile/build-output/archive-0.1.1-15.log`. Upload log: `apps/mobile/build-output/upload-0.1.1-15.log`.
