#!/bin/bash

# ICNS 파일 생성 스크립트
# Mac App Store 제출용 아이콘 생성

echo "Creating ICNS file with all required sizes..."

# Assets.xcassets에서 아이콘 가져오기
ICON_PATH="build/Assets.xcassets/AppIcon.appiconset"
OUTPUT_DIR="build"

# 임시 iconset 디렉토리 생성
ICONSET_DIR="$OUTPUT_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# 필요한 아이콘 크기 복사
cp "$ICON_PATH/16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$ICON_PATH/32.png" "$ICONSET_DIR/icon_16x16@2x.png"
cp "$ICON_PATH/32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$ICON_PATH/64.png" "$ICONSET_DIR/icon_32x32@2x.png"
cp "$ICON_PATH/128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$ICON_PATH/256.png" "$ICONSET_DIR/icon_128x128@2x.png"
cp "$ICON_PATH/256.png" "$ICONSET_DIR/icon_256x256.png"
cp "$ICON_PATH/512.png" "$ICONSET_DIR/icon_256x256@2x.png"
cp "$ICON_PATH/512.png" "$ICONSET_DIR/icon_512x512.png"
cp "$ICON_PATH/1024.png" "$ICONSET_DIR/icon_512x512@2x.png"

# ICNS 파일 생성
iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_DIR/icon.icns"

# Resources 디렉토리에도 복사
cp "$OUTPUT_DIR/icon.icns" "resources/icon.icns"

# 임시 디렉토리 삭제
rm -rf "$ICONSET_DIR"

echo "✅ ICNS file created successfully at $OUTPUT_DIR/icon.icns"
echo "✅ Also copied to resources/icon.icns"