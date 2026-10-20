#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build-output
xcodebuild -workspace ios/NeowFocus.xcworkspace -scheme NeowFocus -configuration Release -destination 'generic/platform=iOS' -archivePath build-output/NeowFocus.xcarchive -allowProvisioningUpdates archive
