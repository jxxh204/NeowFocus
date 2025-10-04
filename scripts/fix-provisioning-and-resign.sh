#!/bin/bash

# Provisioning profile을 embedded.provisionprofile로 복사하고 다시 서명

set -e

APP_PATH="dist/mas-universal/NeowFocus.app"
IDENTITY="Apple Distribution: JaeHwan Kim (L67FAG9382)"
PROVISIONING_PROFILE="build/NeowFocus_Mac_App_Store.provisionprofile"
ENTITLEMENTS="build/entitlements.mas.plist"
ENTITLEMENTS_INHERIT="build/entitlements.mas.inherit.plist"

echo "🔄 Provisioning profile 추가 및 재서명..."

# 1. 기존 서명 제거
echo "1. 기존 서명 제거 중..."
codesign --remove-signature "$APP_PATH"

# 2. Provisioning profile 복사
echo "2. Provisioning profile 복사..."
cp "$PROVISIONING_PROFILE" "$APP_PATH/Contents/embedded.provisionprofile"
echo "   ✓ embedded.provisionprofile 복사됨"

# 3. Helper 앱들에도 복사
for helper in "NeowFocus Helper" "NeowFocus Helper (GPU)" "NeowFocus Helper (Plugin)" "NeowFocus Helper (Renderer)"; do
  HELPER_PATH="$APP_PATH/Contents/Frameworks/$helper.app"
  if [ -d "$HELPER_PATH" ]; then
    codesign --remove-signature "$HELPER_PATH"
    cp "$PROVISIONING_PROFILE" "$HELPER_PATH/Contents/embedded.provisionprofile"
    echo "   ✓ $helper.app에 provisioning profile 복사됨"
  fi
done

# 4. Helper 앱들 다시 서명
echo "3. Helper 앱들 재서명..."
for helper in "NeowFocus Helper" "NeowFocus Helper (GPU)" "NeowFocus Helper (Plugin)" "NeowFocus Helper (Renderer)"; do
  HELPER_PATH="$APP_PATH/Contents/Frameworks/$helper.app"
  if [ -d "$HELPER_PATH" ]; then
    codesign --force --sign "$IDENTITY" \
      --entitlements "$ENTITLEMENTS_INHERIT" \
      --timestamp \
      "$HELPER_PATH"
    echo "   ✓ $helper.app 재서명됨"
  fi
done

# 5. 메인 앱 재서명
echo "4. 메인 앱 재서명..."
codesign --force --sign "$IDENTITY" \
  --entitlements "$ENTITLEMENTS" \
  --timestamp \
  "$APP_PATH"

echo "   ✓ 메인 앱 재서명됨"

# 6. 검증
echo "5. 서명 검증..."
codesign --verify --strict --verbose=2 "$APP_PATH"
echo "   ✓ 서명 검증 완료"

# 7. Provisioning profile 확인
echo "6. Provisioning profile 확인..."
if [ -f "$APP_PATH/Contents/embedded.provisionprofile" ]; then
  echo "   ✓ embedded.provisionprofile 존재"
  ls -lh "$APP_PATH/Contents/embedded.provisionprofile"
else
  echo "   ❌ embedded.provisionprofile 없음!"
  exit 1
fi

echo ""
echo "✅ 완료! PKG를 다시 생성하세요:"
echo "   productbuild --component dist/mas-universal/NeowFocus.app /Applications \\"
echo "     --sign \"3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)\" \\"
echo "     dist/NeowFocus-0.0.82-mas.pkg"
