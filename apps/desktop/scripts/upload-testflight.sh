#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
archive_path="${1:?Usage: upload-testflight.sh path/to/distribution.xcarchive [export-directory]}"
export_path="${2:-build-output/TestFlight}"
app_path="$archive_path/Products/Applications/NeowFocus.app"
codesign --verify --deep --strict "$app_path"
signature=$(codesign -dvv "$app_path" 2>&1)
if ! printf '%s\n' "$signature" | grep -q '^Authority=Apple Distribution:.*(L67FAG9382)$'; then
  echo 'Expected a verified Apple Distribution signed NeowFocus archive.' >&2
  exit 1
fi
xcodebuild -exportArchive -archivePath "$archive_path" -exportPath "$export_path" \
  -exportOptionsPlist scripts/TestFlight.plist -allowProvisioningUpdates
