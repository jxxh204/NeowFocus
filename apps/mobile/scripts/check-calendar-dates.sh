#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
calendar_test_device="${1:?Usage: check-calendar-dates.sh <booted-iOS-simulator-UDID>}"
calendar_sdk_path="$(xcrun --sdk iphonesimulator --show-sdk-path)"
mkdir -p build-output/CalendarDateTests
xcrun --sdk iphonesimulator swiftc \
  -target arm64-apple-ios16.4-simulator -sdk "$calendar_sdk_path" \
  -module-cache-path build-output/CalendarDateTests/ModuleCache \
  tests/native/CalendarDates.swift modules/neowfocus-native/ios/FocusCalendar.swift \
  -o build-output/CalendarDateTests/check-calendar-dates
xcrun simctl spawn "$calendar_test_device" "$PWD/build-output/CalendarDateTests/check-calendar-dates"
