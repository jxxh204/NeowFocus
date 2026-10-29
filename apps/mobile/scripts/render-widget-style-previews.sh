#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
widget_preview_device="${1:?Usage: render-widget-style-previews.sh <booted-iOS-simulator-UDID>}"
widget_preview_sdk="$(xcrun --sdk iphonesimulator --show-sdk-path)"
mkdir -p build-output/WidgetStyleTests/Previews
# Only change the entry point in the build copy. The production view bodies
# remain byte-identical; no snapshot flag is introduced into the shipping app.
python3 - <<'PY'
from pathlib import Path
s=Path('native-sources/NeowFocusWidgets/FocusWidgets.swift').read_text()
entry='@main\nstruct NeowFocusWidgetBundle'
assert s.count(entry)==1
Path('build-output/WidgetStyleTests/FocusWidgetsForSnapshots.swift').write_text(s.replace(entry,'struct NeowFocusWidgetBundle'))
PY
xcrun --sdk iphonesimulator swiftc \
  -target arm64-apple-ios16.4-simulator -sdk "$widget_preview_sdk" \
  -module-cache-path build-output/WidgetStyleTests/ModuleCache \
  tests/native/WidgetViewSnapshots.swift build-output/WidgetStyleTests/FocusWidgetsForSnapshots.swift \
  native-sources/NeowFocusWidgets/FocusArt.swift modules/neowfocus-native/ios/FocusShared.swift \
  modules/neowfocus-native/ios/CloudStore.swift -o build-output/WidgetStyleTests/render-widget-previews
xcrun simctl spawn "$widget_preview_device" "$PWD/build-output/WidgetStyleTests/render-widget-previews" "$PWD/build-output/WidgetStyleTests/Previews"
