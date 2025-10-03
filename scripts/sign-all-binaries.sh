#!/bin/bash

# Sign all binaries with sandbox entitlements for Mac App Store
# This script ensures all executables have the required app-sandbox entitlement

APP_PATH="dist/mas-universal/NeowFocus.app"
ENTITLEMENTS="build/entitlements.mas.plist"
ENTITLEMENTS_INHERIT="build/entitlements.mas.inherit.plist"
IDENTITY="${CSC_NAME:-Apple Distribution: JaeHwan Kim (L67FAG9382)}"

if [ ! -d "$APP_PATH" ]; then
    echo "Error: App not found at $APP_PATH"
    exit 1
fi

echo "🔐 Signing all binaries with sandbox entitlements..."

# Sign Helper apps with inherit entitlements
HELPERS=(
    "$APP_PATH/Contents/Frameworks/NeowFocus Helper.app"
    "$APP_PATH/Contents/Frameworks/NeowFocus Helper (GPU).app"
    "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Plugin).app"
    "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Renderer).app"
)

for helper in "${HELPERS[@]}"; do
    if [ -d "$helper" ]; then
        echo "Signing helper: $(basename "$helper")"
        codesign --force --deep --sign "$IDENTITY" \
            --entitlements "$ENTITLEMENTS_INHERIT" \
            --timestamp \
            "$helper"
    fi
done

# Sign chrome_crashpad_handler if it exists
CRASHPAD="$APP_PATH/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler"
if [ -f "$CRASHPAD" ]; then
    echo "Signing chrome_crashpad_handler..."
    codesign --force --sign "$IDENTITY" \
        --entitlements "$ENTITLEMENTS_INHERIT" \
        --timestamp \
        "$CRASHPAD"
fi

# Sign Squirrel ShipIt if it exists (shouldn't be in MAS build, but just in case)
SHIPIT="$APP_PATH/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt"
if [ -f "$SHIPIT" ]; then
    echo "Warning: Squirrel.framework found in MAS build - this should be removed"
    echo "Signing ShipIt..."
    codesign --force --sign "$IDENTITY" \
        --entitlements "$ENTITLEMENTS_INHERIT" \
        --timestamp \
        "$SHIPIT"
fi

# Sign Electron Framework
echo "Signing Electron Framework..."
codesign --force --deep --sign "$IDENTITY" \
    --timestamp \
    "$APP_PATH/Contents/Frameworks/Electron Framework.framework"

# Finally, sign the main app
echo "Signing main app..."
codesign --force --deep --sign "$IDENTITY" \
    --entitlements "$ENTITLEMENTS" \
    --timestamp \
    "$APP_PATH"

echo "✅ All binaries signed"

# Verify signatures
echo ""
echo "🔍 Verifying signatures..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

echo ""
echo "📋 Checking entitlements..."
echo "Main app:"
codesign -d --entitlements - "$APP_PATH" 2>&1 | grep -A1 "app-sandbox"

echo ""
echo "Helper apps:"
for helper in "${HELPERS[@]}"; do
    if [ -d "$helper" ]; then
        echo "$(basename "$helper"):"
        codesign -d --entitlements - "$helper" 2>&1 | grep -A1 "app-sandbox"
    fi
done