#!/bin/bash

# Create temporary directory for icon conversion
TEMP_DIR=$(mktemp -d)
ICONSET_DIR="$TEMP_DIR/AppIcon.iconset"
mkdir -p "$ICONSET_DIR"

# Source directory
APPICONSET_DIR="build/Assets.xcassets/AppIcon.appiconset"

# Copy and rename files to iconset format
cp "$APPICONSET_DIR/AppIcon-16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$APPICONSET_DIR/AppIcon-16@2x.png" "$ICONSET_DIR/icon_16x16@2x.png"
cp "$APPICONSET_DIR/AppIcon-32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$APPICONSET_DIR/AppIcon-32@2x.png" "$ICONSET_DIR/icon_32x32@2x.png"
cp "$APPICONSET_DIR/AppIcon-128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$APPICONSET_DIR/AppIcon-128@2x.png" "$ICONSET_DIR/icon_128x128@2x.png"
cp "$APPICONSET_DIR/AppIcon-256.png" "$ICONSET_DIR/icon_256x256.png"
cp "$APPICONSET_DIR/AppIcon-256@2x.png" "$ICONSET_DIR/icon_256x256@2x.png"
cp "$APPICONSET_DIR/AppIcon-512.png" "$ICONSET_DIR/icon_512x512.png"
cp "$APPICONSET_DIR/AppIcon-512@2x.png" "$ICONSET_DIR/icon_512x512@2x.png"

# Create icns file
iconutil -c icns "$ICONSET_DIR" -o "build/AppIcon.icns"

# Clean up
rm -rf "$TEMP_DIR"

echo "✅ Created build/AppIcon.icns from Assets.xcassets"