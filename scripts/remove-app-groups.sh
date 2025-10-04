#!/bin/bash

# 빌드 후 App Groups를 제거하고 다시 서명하는 스크립트

APP_PATH="dist/mas-universal/NeowFocus.app"
IDENTITY="Apple Distribution: JaeHwan Kim (L67FAG9382)"
ENTITLEMENTS_MAIN="build/entitlements.mas.plist"
ENTITLEMENTS_INHERIT="build/entitlements.mas.inherit.plist"
PROVISIONING_PROFILE="build/NeowFocus_Mac_App_Store.provisionprofile"

# App Groups가 없는 임시 entitlements 파일 생성
cat > /tmp/entitlements-no-groups.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.application-identifier</key>
    <string>L67FAG9382.com.neowfocus.pomodorotimer</string>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.developer.team-identifier</key>
    <string>L67FAG9382</string>
</dict>
</plist>
EOF

echo "🔄 Removing App Groups and re-signing..."

# 메인 실행 파일 다시 서명
codesign --force --sign "$IDENTITY" \
  --entitlements /tmp/entitlements-no-groups.plist \
  --timestamp \
  "$APP_PATH/Contents/MacOS/NeowFocus"

echo "✓ Re-signed main executable"

# 메인 앱 번들 다시 서명
codesign --force --sign "$IDENTITY" \
  --entitlements /tmp/entitlements-no-groups.plist \
  --timestamp \
  "$APP_PATH"

echo "✓ Re-signed main app bundle"

# 검증
echo ""
echo "🔍 Verifying signature..."
codesign --verify --strict --verbose=2 "$APP_PATH"

echo ""
echo "📋 Final entitlements:"
codesign -d --entitlements :- "$APP_PATH" 2>&1 | grep -v "^Executable"

echo ""
echo "✅ Done!"
