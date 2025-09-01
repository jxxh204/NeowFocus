#!/bin/bash

APP_PATH="dist/mas-universal/NeowFocus.app"
RESOURCES_PATH="$APP_PATH/Contents/Resources"

echo "🔍 Asset Catalog 확인..."
echo "=========================="

# 1. Assets.car 파일 존재 확인
echo "📁 Assets.car 파일 확인:"
if [ -f "$RESOURCES_PATH/Assets.car" ]; then
  echo "✅ Assets.car 파일 존재"
  ls -lh "$RESOURCES_PATH/Assets.car"
else
  echo "❌ Assets.car 파일 없음"
  # icon.icns 파일 확인
  if [ -f "$RESOURCES_PATH/icon.icns" ]; then
    echo "  ℹ️  대신 icon.icns 파일 사용 중"
    ls -lh "$RESOURCES_PATH/icon.icns"
  fi
fi
echo ""

# 2. Info.plist 아이콘 설정 확인
echo "📋 Info.plist 아이콘 설정:"
ICON_FILE=$(/usr/libexec/PlistBuddy -c "Print CFBundleIconFile" "$APP_PATH/Contents/Info.plist" 2>/dev/null)
ICON_NAME=$(/usr/libexec/PlistBuddy -c "Print CFBundleIconName" "$APP_PATH/Contents/Info.plist" 2>/dev/null)

echo "  CFBundleIconFile: $ICON_FILE"
echo "  CFBundleIconName: $ICON_NAME"
echo ""

# 3. Asset Catalog 소스 확인
echo "📦 Asset Catalog 소스 확인:"
if [ -d "build/Assets.xcassets/AppIcon.appiconset" ]; then
  echo "✅ AppIcon.appiconset 존재"
  echo "  파일 개수: $(ls build/Assets.xcassets/AppIcon.appiconset/*.png 2>/dev/null | wc -l) PNG 파일"
else
  echo "❌ AppIcon.appiconset 디렉토리 없음"
fi
echo ""

# 4. Resources 폴더 내용 확인
echo "📂 Resources 폴더 아이콘 관련 파일:"
ls -la "$RESOURCES_PATH/" | grep -E "(icon|Icon|asset|Asset|car)" || echo "  아이콘 관련 파일 없음"
echo ""

# 5. assetutil로 내용 확인 (가능하다면)
if [ -f "$RESOURCES_PATH/Assets.car" ] && command -v assetutil &> /dev/null; then
  echo "🎨 Asset Catalog 내용 (상위 20줄):"
  assetutil --info "$RESOURCES_PATH/Assets.car" 2>/dev/null | head -20
  echo ""
  echo "  AppIcon 관련 항목:"
  assetutil --info "$RESOURCES_PATH/Assets.car" 2>/dev/null | grep -i appicon | head -10
else
  if [ -f "$RESOURCES_PATH/Assets.car" ]; then
    echo "⚠️  Assets.car 파일은 있지만 assetutil을 사용할 수 없습니다"
  else
    echo "ℹ️  Assets.car 파일이 없어서 기존 icon.icns 방식 사용 중"
  fi
fi
echo ""

# 6. 빌드 설정 확인
echo "🔧 빌드 설정 확인 (package.json):"
if grep -q "assetsCatalog" package.json 2>/dev/null; then
  echo "✅ assetsCatalog 설정 있음:"
  grep -A2 -B2 "assetsCatalog" package.json | head -10
else
  echo "❌ assetsCatalog 설정 없음"
  echo "  icon 설정:"
  grep -E '"icon":|"icons":' package.json | head -5
fi
echo ""

# 7. 앱 아이콘 표시 테스트
echo "🖼️  앱 아이콘 표시 테스트:"
echo "  1. Finder에서 확인: open \"$(dirname "$APP_PATH")\""
echo "  2. 앱 정보 보기: 앱 우클릭 → 정보 가져오기"
echo "  3. Dock에 추가해서 아이콘 확인"
echo ""

# 8. 진단 및 권장사항
echo "📊 진단 결과:"
if [ -f "$RESOURCES_PATH/Assets.car" ]; then
  echo "✅ Asset Catalog (Assets.car) 방식 사용 중 - Mac App Store 권장"
elif [ -f "$RESOURCES_PATH/icon.icns" ]; then
  echo "⚠️  기존 icon.icns 방식 사용 중"
  echo "  → Mac App Store 제출 시 Asset Catalog 방식 권장"
  echo "  → package.json에 assetsCatalog 설정 추가 필요"
else
  echo "❌ 아이콘 파일이 없습니다!"
fi

echo ""
echo "✅ 확인 완료!"