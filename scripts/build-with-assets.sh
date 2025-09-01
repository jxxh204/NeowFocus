#!/bin/bash

echo "🚀 Building NeowFocus with Asset Catalog support..."
echo "================================================"

# 1. Asset Catalog 컴파일
echo ""
echo "1️⃣  Compiling Asset Catalog..."
./scripts/compile-assets.sh

if [ ! -f "build/compiled/Assets.car" ]; then
    echo "❌ Assets.car 컴파일 실패"
    exit 1
fi

# 2. Mac App Store 빌드
echo ""
echo "2️⃣  Building for Mac App Store..."
CSC_NAME="Apple Distribution: JaeHwan Kim (L67FAG9382)" npm run build:mas

# 3. 빌드 결과 확인
echo ""
echo "3️⃣  Checking build results..."
./scripts/check-assets.sh

echo ""
echo "✅ Build complete!"