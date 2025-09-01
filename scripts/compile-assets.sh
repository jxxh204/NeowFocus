#!/bin/bash

# Asset Catalog을 Assets.car로 컴파일하는 스크립트

echo "🎨 Compiling Asset Catalog to Assets.car..."

# 빌드 디렉토리 생성
mkdir -p build/compiled

# actool을 사용하여 Assets.xcassets를 Assets.car로 컴파일
if command -v actool &> /dev/null; then
    echo "📦 Using actool to compile Assets.xcassets..."
    
    # Mac App Store 타겟용 컴파일
    actool \
        --compile build/compiled \
        --platform macosx \
        --minimum-deployment-target 11.0 \
        --app-icon AppIcon \
        --output-partial-info-plist build/compiled/assets-info.plist \
        build/Assets.xcassets
    
    if [ -f "build/compiled/Assets.car" ]; then
        echo "✅ Assets.car 생성 완료: build/compiled/Assets.car"
        ls -lh build/compiled/Assets.car
    else
        echo "⚠️  Assets.car 파일이 생성되지 않았습니다"
        echo "   컴파일된 파일 목록:"
        ls -la build/compiled/
    fi
else
    echo "❌ actool이 설치되어 있지 않습니다. Xcode가 필요합니다."
    exit 1
fi

echo ""
echo "📋 생성된 Info.plist 정보:"
if [ -f "build/compiled/assets-info.plist" ]; then
    cat build/compiled/assets-info.plist
fi

echo ""
echo "✅ Asset Catalog 컴파일 완료!"