#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
archive_path="${1:?Usage: upload-testflight.sh build-output/NeowFocus-VERSION-BUILD.xcarchive [export-directory]}"
export_path="${2:-build-output/TestFlight}"
if [[ ! -d "$archive_path" ]]; then
  echo "Archive not found: $archive_path" >&2
  exit 1
fi
xcodebuild -exportArchive -archivePath "$archive_path" -exportPath "$export_path" -exportOptionsPlist scripts/TestFlight.plist -allowProvisioningUpdates
