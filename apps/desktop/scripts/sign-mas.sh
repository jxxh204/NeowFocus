#!/bin/bash

set -e

APP_PATH="out/NeowFocus-mas-universal/NeowFocus.app"
IDENTITY="3rd Party Mac Developer Application: JaeHwan Kim (L67FAG9382)"
ENTITLEMENTS="build/entitlements.mas.plist"
ENTITLEMENTS_INHERIT="build/entitlements.mas.inherit.plist"
PROVISIONING_PROFILE="build/NeowFocus_Mac_App_Store.provisionprofile"

echo "🔧 MAS 서명 시작..."

# Helper 앱들 서명
echo "📦 Helper 앱 서명 중..."
find "$APP_PATH/Contents/Frameworks" -name "*.app" -type d | while read -r helper; do
    echo "  - $(basename "$helper")"
    # Provisioning Profile 복사
    cp "$PROVISIONING_PROFILE" "$helper/Contents/embedded.provisionprofile"
    # 서명 (경고 무시)
    codesign --sign "$IDENTITY" --force --entitlements "$ENTITLEMENTS_INHERIT" "$helper" 2>&1 | grep -v "unable to build chain" | grep -v "Warning:" || true
done

# Frameworks 서명
echo "📦 Framework 서명 중..."
codesign --sign "$IDENTITY" --force "$APP_PATH/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework" 2>&1 | grep -v "unable to build chain" | grep -v "Warning:" || true
codesign --sign "$IDENTITY" --force "$APP_PATH/Contents/Frameworks/Electron Framework.framework" 2>&1 | grep -v "unable to build chain" | grep -v "Warning:" || true

# Login Helper 서명 (있다면)
if [ -d "$APP_PATH/Contents/Library/LoginItems/NeowFocus Login Helper.app" ]; then
    echo "📦 Login Helper 서명 중..."
    cp "$PROVISIONING_PROFILE" "$APP_PATH/Contents/Library/LoginItems/NeowFocus Login Helper.app/Contents/embedded.provisionprofile"
    codesign --sign "$IDENTITY" --force --entitlements "$ENTITLEMENTS_INHERIT" "$APP_PATH/Contents/Library/LoginItems/NeowFocus Login Helper.app" 2>&1 | grep -v "unable to build chain" | grep -v "Warning:" || true
fi

# Provisioning Profile을 메인 앱에 복사
echo "📦 Provisioning Profile 삽입..."
cp "$PROVISIONING_PROFILE" "$APP_PATH/Contents/embedded.provisionprofile"

# 메인 앱 서명
echo "📦 메인 앱 서명 중..."
codesign --sign "$IDENTITY" --force --entitlements "$ENTITLEMENTS" "$APP_PATH" 2>&1 | grep -v "unable to build chain" | grep -v "Warning:" || true

# 서명 검증
echo "✅ 서명 검증 중..."
codesign -dvvv "$APP_PATH" 2>&1 | grep -E "(Authority|Signature)"

# 권한 수정
echo "🔧 권한 수정 중..."
chmod -R a+rX "$APP_PATH"

echo "✅ MAS 서명 완료!"
