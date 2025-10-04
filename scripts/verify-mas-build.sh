#!/bin/bash

echo "🔍 Mac App Store 빌드 검증 중..."
echo ""

APP_PATH="dist/mas-universal/NeowFocus.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ 앱을 찾을 수 없습니다: $APP_PATH"
    echo "먼저 'npm run build:mas' 를 실행하세요"
    exit 1
fi

FAILED=0

echo "1️⃣ Squirrel.framework 제거 확인..."
if [ -d "$APP_PATH/Contents/Frameworks/Squirrel.framework" ]; then
    echo "❌ Squirrel.framework가 아직 존재합니다!"
    FAILED=1
else
    echo "✅ Squirrel.framework 제거됨"
fi

echo ""
echo "2️⃣ Helper 앱 Provisioning Profile 확인..."
check_helper_profile() {
    local helper_path=$1
    local helper_name=$(basename "$helper_path")

    if [ ! -d "$helper_path" ]; then
        return
    fi

    if [ -f "$helper_path/Contents/embedded.provisionprofile" ]; then
        echo "   ✅ $helper_name"
    else
        echo "   ❌ $helper_name - provisioning profile 없음!"
        FAILED=1
    fi
}

check_helper_profile "$APP_PATH/Contents/Frameworks/NeowFocus Helper.app"
check_helper_profile "$APP_PATH/Contents/Frameworks/NeowFocus Helper (GPU).app"
check_helper_profile "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Plugin).app"
check_helper_profile "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Renderer).app"

echo ""
echo "3️⃣ 메인 앱 Provisioning Profile 확인..."
PROFILE_PATH="$APP_PATH/Contents/embedded.provisionprofile"
if [ -f "$PROFILE_PATH" ]; then
    echo "✅ 메인 앱 provisioning profile 존재"
else
    echo "❌ 메인 앱 provisioning profile 없음!"
    FAILED=1
fi

echo ""
echo "4️⃣ 서명 검증..."
verify_signature() {
    local path=$1
    local name=$2

    if [ ! -e "$path" ]; then
        return
    fi

    if codesign -vv --strict "$path" 2>&1 | grep -q "valid on disk"; then
        echo "   ✅ $name"
    else
        echo "   ❌ $name - 서명 오류"
        FAILED=1
    fi
}

verify_signature "$APP_PATH" "메인 앱"
verify_signature "$APP_PATH/Contents/Frameworks/NeowFocus Helper.app" "Helper"
verify_signature "$APP_PATH/Contents/Frameworks/NeowFocus Helper (GPU).app" "Helper (GPU)"
verify_signature "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Plugin).app" "Helper (Plugin)"
verify_signature "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Renderer).app" "Helper (Renderer)"

echo ""
echo "5️⃣ Entitlements 확인 (App Sandbox)..."
check_sandbox() {
    local path=$1
    local name=$2

    if [ ! -e "$path" ]; then
        return
    fi

    if codesign -d --entitlements :- "$path" 2>/dev/null | grep -q "com.apple.security.app-sandbox"; then
        echo "   ✅ $name"
    else
        echo "   ❌ $name - App Sandbox 없음!"
        FAILED=1
    fi
}

check_sandbox "$APP_PATH" "메인 앱"
check_sandbox "$APP_PATH/Contents/Frameworks/NeowFocus Helper.app" "Helper"
check_sandbox "$APP_PATH/Contents/Frameworks/NeowFocus Helper (GPU).app" "Helper (GPU)"
check_sandbox "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Plugin).app" "Helper (Plugin)"
check_sandbox "$APP_PATH/Contents/Frameworks/NeowFocus Helper (Renderer).app" "Helper (Renderer)"

echo ""
echo "6️⃣ 번들 ID 확인..."
BUNDLE_ID=$(plutil -p "$APP_PATH/Contents/Info.plist" | grep CFBundleIdentifier | cut -d'"' -f4)
echo "   번들 ID: $BUNDLE_ID"

if [ "$BUNDLE_ID" = "com.neowfocus.pomodorotimer" ]; then
    echo "   ✅ 올바른 번들 ID"
else
    echo "   ❌ 번들 ID 불일치"
    FAILED=1
fi

echo ""
echo "7️⃣ 버전 정보..."
VERSION=$(plutil -p "$APP_PATH/Contents/Info.plist" | grep CFBundleShortVersionString | cut -d'"' -f4)
BUILD=$(plutil -p "$APP_PATH/Contents/Info.plist" | grep CFBundleVersion | cut -d'"' -f4)
echo "   버전: $VERSION (빌드 $BUILD)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo "✅ 모든 검증 통과! 업로드 가능합니다."
    echo ""
    echo "📦 PKG 파일 위치:"
    ls -lh dist/mas-universal/*.pkg 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
    echo "🚀 업로드 명령어:"
    echo "   xcrun altool --upload-app --type macos --file dist/mas-universal/*.pkg \\"
    echo "     --username \"your-apple-id@email.com\" \\"
    echo "     --password \"@keychain:AC_PASSWORD\""
else
    echo "❌ 검증 실패! 위의 오류를 확인하고 다시 빌드하세요."
    exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
