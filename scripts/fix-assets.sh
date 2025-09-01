#!/bin/bash

echo "🔧 Converting to macOS Asset Catalog..."

# 기존 Assets.xcassets 백업
if [ -d "build/Assets.xcassets" ]; then
  mv build/Assets.xcassets build/Assets.xcassets.backup
fi

# macOS용 Asset Catalog 구조 생성
mkdir -p build/Assets.xcassets/AppIcon.appiconset

# Contents.json (루트)
cat > build/Assets.xcassets/Contents.json << 'EOF'
{
  "info": {
    "author": "xcode",
    "version": 1
  }
}
EOF

# macOS용 Contents.json
cat > build/Assets.xcassets/AppIcon.appiconset/Contents.json << 'EOF'
{
  "images": [
    {
      "filename": "icon_16x16.png",
      "idiom": "mac",
      "scale": "1x",
      "size": "16x16"
    },
    {
      "filename": "icon_16x16@2x.png", 
      "idiom": "mac",
      "scale": "2x",
      "size": "16x16"
    },
    {
      "filename": "icon_32x32.png",
      "idiom": "mac",
      "scale": "1x", 
      "size": "32x32"
    },
    {
      "filename": "icon_32x32@2x.png",
      "idiom": "mac",
      "scale": "2x",
      "size": "32x32"
    },
    {
      "filename": "icon_128x128.png",
      "idiom": "mac",
      "scale": "1x",
      "size": "128x128" 
    },
    {
      "filename": "icon_128x128@2x.png",
      "idiom": "mac", 
      "scale": "2x",
      "size": "128x128"
    },
    {
      "filename": "icon_256x256.png",
      "idiom": "mac",
      "scale": "1x",
      "size": "256x256"
    },
    {
      "filename": "icon_256x256@2x.png",
      "idiom": "mac",
      "scale": "2x", 
      "size": "256x256"
    },
    {
      "filename": "icon_512x512.png", 
      "idiom": "mac",
      "scale": "1x",
      "size": "512x512"
    },
    {
      "filename": "icon_512x512@2x.png",
      "idiom": "mac",
      "scale": "2x",
      "size": "512x512"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
EOF

# 기존 파일들에서 macOS용 크기 매핑
BACKUP_DIR="build/Assets.xcassets.backup/AppIcon.appiconset"

if [ -d "$BACKUP_DIR" ]; then
  echo "📁 Mapping existing icons to macOS format..."
  
  # 파일 매핑 (기존크기 → macOS이름)
  declare -A file_mapping=(
    ["16.png"]="icon_16x16.png"
    ["32.png"]="icon_16x16@2x.png"
    ["32.png"]="icon_32x32.png" 
    ["64.png"]="icon_32x32@2x.png"
    ["128.png"]="icon_128x128.png"
    ["256.png"]="icon_128x128@2x.png"
    ["256.png"]="icon_256x256.png"
    ["512.png"]="icon_256x256@2x.png" 
    ["512.png"]="icon_512x512.png"
    ["1024.png"]="icon_512x512@2x.png"
  )
  
  # 파일 복사
  for src_file in "${!file_mapping[@]}"; do
    dest_file="${file_mapping[$src_file]}"
    if [ -f "$BACKUP_DIR/$src_file" ]; then
      cp "$BACKUP_DIR/$src_file" "build/Assets.xcassets/AppIcon.appiconset/$dest_file"
      echo "✅ Copied: $src_file → $dest_file"
    fi
  done
  
  # 중복 처리 (수동으로 올바른 크기 매핑)
  [ -f "$BACKUP_DIR/16.png" ] && cp "$BACKUP_DIR/16.png" "build/Assets.xcassets/AppIcon.appiconset/icon_16x16.png"
  [ -f "$BACKUP_DIR/32.png" ] && cp "$BACKUP_DIR/32.png" "build/Assets.xcassets/AppIcon.appiconset/icon_32x32.png"
  [ -f "$BACKUP_DIR/32.png" ] && cp "$BACKUP_DIR/32.png" "build/Assets.xcassets/AppIcon.appiconset/icon_16x16@2x.png"
  [ -f "$BACKUP_DIR/64.png" ] && cp "$BACKUP_DIR/64.png" "build/Assets.xcassets/AppIcon.appiconset/icon_32x32@2x.png"
  [ -f "$BACKUP_DIR/128.png" ] && cp "$BACKUP_DIR/128.png" "build/Assets.xcassets/AppIcon.appiconset/icon_128x128.png"
  [ -f "$BACKUP_DIR/256.png" ] && cp "$BACKUP_DIR/256.png" "build/Assets.xcassets/AppIcon.appiconset/icon_256x256.png"
  [ -f "$BACKUP_DIR/256.png" ] && cp "$BACKUP_DIR/256.png" "build/Assets.xcassets/AppIcon.appiconset/icon_128x128@2x.png"
  [ -f "$BACKUP_DIR/512.png" ] && cp "$BACKUP_DIR/512.png" "build/Assets.xcassets/AppIcon.appiconset/icon_512x512.png"
  [ -f "$BACKUP_DIR/512.png" ] && cp "$BACKUP_DIR/512.png" "build/Assets.xcassets/AppIcon.appiconset/icon_256x256@2x.png"
  [ -f "$BACKUP_DIR/1024.png" ] && cp "$BACKUP_DIR/1024.png" "build/Assets.xcassets/AppIcon.appiconset/icon_512x512@2x.png"
  
else
  echo "⚠️  No backup found, using icon.icns instead..."
  
  # icon.icns에서 생성
  if [ -f "build/icon.icns" ]; then
    iconutil -c iconset build/icon.icns -o /tmp/temp.iconset
    
    # iconset에서 복사
    [ -f "/tmp/temp.iconset/icon_16x16.png" ] && cp "/tmp/temp.iconset/icon_16x16.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_16x16@2x.png" ] && cp "/tmp/temp.iconset/icon_16x16@2x.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_32x32.png" ] && cp "/tmp/temp.iconset/icon_32x32.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_32x32@2x.png" ] && cp "/tmp/temp.iconset/icon_32x32@2x.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_128x128.png" ] && cp "/tmp/temp.iconset/icon_128x128.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_128x128@2x.png" ] && cp "/tmp/temp.iconset/icon_128x128@2x.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_256x256.png" ] && cp "/tmp/temp.iconset/icon_256x256.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_256x256@2x.png" ] && cp "/tmp/temp.iconset/icon_256x256@2x.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_512x512.png" ] && cp "/tmp/temp.iconset/icon_512x512.png" "build/Assets.xcassets/AppIcon.appiconset/"
    [ -f "/tmp/temp.iconset/icon_512x512@2x.png" ] && cp "/tmp/temp.iconset/icon_512x512@2x.png" "build/Assets.xcassets/AppIcon.appiconset/"
    
    rm -rf /tmp/temp.iconset
  fi
fi

# 정리
rm -rf build/Assets.xcassets.backup

echo "✅ macOS Asset Catalog created!"
echo "📁 Final structure:"
find build/Assets.xcassets -name "*.png" | sort