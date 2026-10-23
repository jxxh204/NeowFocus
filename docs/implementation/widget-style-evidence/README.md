# Timer styles in widgets and Live Activities

Local candidate: **NeowFocus iOS 0.1.1 (15)**. The currently delivered TestFlight build remains **0.1.1 (14)**. No upload or public submission was performed for this candidate. The duck-boat removal was subsequently compiled and rendered offscreen; the earlier signed app build predates that visual-only follow-up.

## Behavior

- The existing `timerStyle` and `showRemainingTime` settings now travel through the native snapshot to the home widget, Lock Screen Live Activity and Dynamic Island.
- Classic retains its existing ring. Blocks use a compact 12×8 exact-cover board derived from the incumbent mobile tile. Water uses two blue-gray surfaces; the duck boat and its passenger have been removed.
- Default/unknown/old snapshots resolve to classic. Optional native fields preserve old Codable payloads. Completion pins the last active style. Idle previews follow preference changes. Pause/resume and queued native commands retain appearance preferences.
- New blocks transition in for 0.32s; water levels transition for 0.45s. Both disable movement for Reduce Motion and reduced-luminance Always-On. No repeatForever, custom timer-font hack, frame loop or new background execution mode is used.
- Artwork is a **snapshot**, not an autonomous background animation. Home-widget timeline delivery is owned by iOS; the existing minute entries are requests, not a guaranteed refresh rate. While foreground/running, themed artwork is republished at most once per wall-clock minute and on lifecycle/state/preference changes. Completed/paused sessions do not receive periodic artwork updates.
- A suspended app cannot guarantee custom Live Activity artwork updates. The last artwork snapshot can remain visible while Apple's native `ProgressView(timerInterval:)` and optional timer text continue to advance. Pause/resume, foreground reconciliation or other valid state updates catch the artwork up. No server/push animation service was introduced.
- Existing task-visibility privacy, widget controls, day count, app links and app-side timer scene remain in place. Publication reads current settings after native command replay, avoiding stale queued preference values.

## Verified

- Mobile TypeScript and `test:timer-styles` checks, including idle preference changes and completion style retention.
- Actual iOS Swift model executable: legacy JSON decoding, new-field round trip, completion/pause preservation, invalid progress inputs, **24 physically droppable tetrominoes covering all 96 cells**.
- iOS Simulator Release build and SwiftUI widget/card type checking.
- Offscreen rendering of the **production** `FocusWidgetContent`, `FocusLiveCard` and artwork in the iOS runtime. Selected paused and completed references are attached below. This is not a SpringBoard or Lock Screen screenshot.
- New native artwork was inspected at 25%, 50% and 100%; small/medium layouts and large Dynamic Type were inspected offscreen. The mechanical design detector returned no findings for the changed Swift files.

## Still pending

The CUA app connection reported **the Mac is locked**. The user was asked to unlock it; actual home-widget placement, tapping pause/resume, real Lock Screen/Dynamic Island delivery, native timer progress rendering, animation playback, Always-On and Reduce Motion device behavior remain **unverified**. No claim of a physical-device test is made.

`ImageRenderer` cannot render system timer progress views: running-state captures show a yellow unsupported-view placeholder, including the pre-existing classic progress view. Do not treat those offscreen captures as a running WidgetKit test. Paused/completed view captures avoid this unsupported renderer path. The renderer also emits `IOSurfaceClientSetSurfaceNotify failed e00002c7` in this headless CLI context but completes with exit 0 and writes PNGs.

## Reproduce

From `apps/mobile`, supply an explicit booted iOS Simulator UDID (several simulators may be running):

```sh
pnpm typecheck
pnpm test:timer-styles
pnpm test:widget-styles <UDID>
bash scripts/render-widget-style-previews.sh <UDID>
```

The preview helper replaces only the WidgetBundle `@main` annotation in an ignored build copy; production view bodies remain identical. Output is under `build-output/WidgetStyleTests/Previews`. Native build logs are `build-output/widget-styles-final-simulator-build.log`; model and preview logs are `widget-styles-model-tests.log` and `widget-styles-preview-script.log`.

## Reference images — offscreen components only

| Classic, paused | Blocks, paused | Water, paused |
|---|---|---|
| ![Classic](paused-small-classic.png) | ![Blocks](paused-small-blocks.png) | ![Water](paused-small-water.png) |

- [Paused Live Activity card](paused-water.png)
- [Completed Live Activity card](completed-water.png)

## Apple references

- [Animating data updates in widgets and Live Activities](https://developer.apple.com/documentation/widgetkit/animating-data-updates-in-widgets-and-live-activities)
- [Keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
