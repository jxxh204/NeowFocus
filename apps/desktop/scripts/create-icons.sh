#!/bin/bash

# 사용법: ./scripts/create-icons.sh <source_image>

SOURCE_IMAGE="$1"

if [ -z "$SOURCE_IMAGE" ]; then
    echo "사용법: $0 <source_image>"
    exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "오류: 이미지 파일을 찾을 수 없습니다: $SOURCE_IMAGE"
    exit 1
fi

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")/.." || exit 1

echo "아이콘 생성 시작..."

# icons.iconset 디렉토리 생성/정리
rm -rf build/icons.iconset
mkdir -p build/icons.iconset

# icons.iconset용 PNG 생성
sizes=(16 32 128 256 512)
for size in "${sizes[@]}"; do
    sips -z $size $size "$SOURCE_IMAGE" --out "build/icons.iconset/icon_${size}x${size}.png" > /dev/null 2>&1
    size2x=$((size * 2))
    sips -z $size2x $size2x "$SOURCE_IMAGE" --out "build/icons.iconset/icon_${size}x${size}@2x.png" > /dev/null 2>&1
    echo "생성: icon_${size}x${size}.png 및 @2x"
done

# Assets.xcassets/AppIcon.appiconset용 PNG 생성
mkdir -p build/Assets.xcassets/AppIcon.appiconset
asset_sizes=(16 32 64 128 256 512 1024)
for size in "${asset_sizes[@]}"; do
    sips -z $size $size "$SOURCE_IMAGE" --out "build/Assets.xcassets/AppIcon.appiconset/${size}.png" > /dev/null 2>&1
    echo "생성: AppIcon ${size}.png"
done

# 256, 512는 중복 파일 생성
cp "build/Assets.xcassets/AppIcon.appiconset/256.png" "build/Assets.xcassets/AppIcon.appiconset/256 1.png"
cp "build/Assets.xcassets/AppIcon.appiconset/32.png" "build/Assets.xcassets/AppIcon.appiconset/32 1.png"
cp "build/Assets.xcassets/AppIcon.appiconset/512.png" "build/Assets.xcassets/AppIcon.appiconset/512 1.png"

# build/icon.png 생성
sips -z 512 512 "$SOURCE_IMAGE" --out "build/icon.png" > /dev/null 2>&1
echo "생성: build/icon.png"

# resources/icon.png 생성
mkdir -p resources
sips -z 512 512 "$SOURCE_IMAGE" --out "resources/icon.png" > /dev/null 2>&1
echo "생성: resources/icon.png"

# icns 파일 생성
echo "icns 파일 생성 중..."
iconutil -c icns build/icons.iconset -o build/icon.icns
cp build/icon.icns resources/icon.icns
echo "생성: build/icon.icns, resources/icon.icns"

# Assets.car 컴파일
echo "Assets.car 컴파일 중..."
if command -v actool > /dev/null 2>&1; then
    actool build/Assets.xcassets --compile build/compiled --platform macosx --minimum-deployment-target 10.13 --app-icon AppIcon --output-partial-info-plist /dev/null 2>&1
    if [ -f build/compiled/Assets.car ]; then
        echo "생성: build/compiled/Assets.car"
    else
        echo "경고: Assets.car 생성 실패"
    fi
else
    echo "경고: actool을 찾을 수 없습니다. Xcode가 설치되어 있는지 확인하세요."
fi

# AppIcon.icns 생성 (Assets.car에서 추출하거나 icons.iconset 사용)
cp build/icon.icns build/compiled/AppIcon.icns 2>/dev/null
echo "생성: build/compiled/AppIcon.icns"

echo ""
echo "✅ 모든 아이콘 생성 완료!"
echo ""
echo "생성된 파일:"
echo "  - build/icons.iconset/*.png (10개)"
echo "  - build/Assets.xcassets/AppIcon.appiconset/*.png (10개)"
echo "  - build/icon.png, build/icon.icns"
echo "  - resources/icon.png, resources/icon.icns"
echo "  - build/compiled/Assets.car"
echo "  - build/compiled/AppIcon.icns"
