#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
widget_test_device="${1:?Usage: check-widget-styles.sh <booted-iOS-simulator-UDID>}"
widget_sdk_path="$(xcrun --sdk iphonesimulator --show-sdk-path)"
mkdir -p build-output/WidgetStyleTests
xcrun --sdk iphonesimulator swiftc \
  -target arm64-apple-ios16.4-simulator -sdk "$widget_sdk_path" \
  -module-cache-path build-output/WidgetStyleTests/ModuleCache \
  tests/native/WidgetStyles.swift native-sources/NeowFocusWidgets/FocusArt.swift \
  modules/neowfocus-native/ios/FocusShared.swift \
  -o build-output/WidgetStyleTests/check-widget-styles
xcrun simctl spawn "$widget_test_device" "$PWD/build-output/WidgetStyleTests/check-widget-styles"
