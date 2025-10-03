#!/bin/bash

# 수동으로 Helper 앱들을 재서명하는 스크립트
# Mac App Store 제출을 위한 샌드박스 entitlements 적용

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 서명 ID (환경변수 또는 기본값)
IDENTITY="${CSC_NAME:-Apple Distribution: JaeHwan Kim (L67FAG9382)}"

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Entitlements 파일 경로
ENTITLEMENTS_MAIN="${PROJECT_ROOT}/build/entitlements.mas.plist"
ENTITLEMENTS_INHERIT="${PROJECT_ROOT}/build/entitlements.mas.inherit.plist"

# 앱 경로
APP_PATH="${PROJECT_ROOT}/dist/mas-universal/NeowFocus.app"
FRAMEWORKS_PATH="${APP_PATH}/Contents/Frameworks"

echo -e "${GREEN}=== Helper Apps 재서명 시작 ===${NC}"
echo "Identity: ${IDENTITY}"
echo "App Path: ${APP_PATH}"
echo ""

# 앱이 존재하는지 확인
if [ ! -d "${APP_PATH}" ]; then
    echo -e "${RED}Error: 앱을 찾을 수 없습니다: ${APP_PATH}${NC}"
    echo "먼저 'npm run build:mas'를 실행하세요."
    exit 1
fi

# Entitlements 파일 확인
if [ ! -f "${ENTITLEMENTS_INHERIT}" ]; then
    echo -e "${RED}Error: entitlements.mas.inherit.plist를 찾을 수 없습니다${NC}"
    exit 1
fi

# Helper 앱들 재서명
HELPERS=(
    "NeowFocus Helper.app"
    "NeowFocus Helper (GPU).app"
    "NeowFocus Helper (Plugin).app"
    "NeowFocus Helper (Renderer).app"
)

for helper in "${HELPERS[@]}"; do
    HELPER_PATH="${FRAMEWORKS_PATH}/${helper}"
    if [ -d "${HELPER_PATH}" ]; then
        echo -e "${YELLOW}서명 중: ${helper}${NC}"
        codesign --force --sign "${IDENTITY}" \
            --preserve-metadata=identifier,entitlements,requirements,flags,runtime \
            --entitlements "${ENTITLEMENTS_INHERIT}" \
            --timestamp "${HELPER_PATH}"
        echo -e "${GREEN}✓ 완료: ${helper}${NC}"
    else
        echo -e "${YELLOW}⚠ 건너뜀: ${helper} (찾을 수 없음)${NC}"
    fi
done

# chrome_crashpad_handler 재서명
CRASHPAD_PATH="${FRAMEWORKS_PATH}/Electron Framework.framework/Versions/Current/Helpers/chrome_crashpad_handler"
if [ -f "${CRASHPAD_PATH}" ]; then
    echo -e "${YELLOW}서명 중: chrome_crashpad_handler${NC}"
    codesign --force --sign "${IDENTITY}" \
        --preserve-metadata=identifier,entitlements,requirements,flags,runtime \
        --entitlements "${ENTITLEMENTS_INHERIT}" \
        --timestamp "${CRASHPAD_PATH}"
    echo -e "${GREEN}✓ 완료: chrome_crashpad_handler${NC}"
fi

# Squirrel.framework 제거 (MAS에는 필요없음)
SQUIRREL_PATH="${FRAMEWORKS_PATH}/Squirrel.framework"
if [ -d "${SQUIRREL_PATH}" ]; then
    echo -e "${YELLOW}제거 중: Squirrel.framework${NC}"
    rm -rf "${SQUIRREL_PATH}"
    echo -e "${GREEN}✓ 제거됨: Squirrel.framework${NC}"
fi

# 메인 앱 재서명
echo -e "${YELLOW}메인 앱 재서명 중...${NC}"
codesign --force --sign "${IDENTITY}" \
    --preserve-metadata=identifier,entitlements,requirements,flags,runtime \
    --entitlements "${ENTITLEMENTS_MAIN}" \
    --timestamp "${APP_PATH}"
echo -e "${GREEN}✓ 메인 앱 재서명 완료${NC}"

echo ""
echo -e "${GREEN}=== 서명 검증 ===${NC}"

# 서명 검증
for helper in "${HELPERS[@]}"; do
    HELPER_PATH="${FRAMEWORKS_PATH}/${helper}"
    if [ -d "${HELPER_PATH}" ]; then
        HELPER_BINARY="${HELPER_PATH}/Contents/MacOS/${helper%.app}"
        echo -e "\n${YELLOW}${helper}:${NC}"
        codesign -dvvv --entitlements - "${HELPER_BINARY}" 2>&1 | grep -A5 "com.apple.security.app-sandbox" || true
    fi
done

echo ""
echo -e "${GREEN}=== 완료 ===${NC}"
echo "Helper 앱들이 샌드박스 entitlements와 함께 재서명되었습니다."
echo ""
echo "다음 단계:"
echo "1. App Store Connect에 업로드: xcrun altool --upload-app -f dist/mas-universal/*.pkg -t macos -u YOUR_APPLE_ID"
echo "2. 또는 Transporter 앱을 사용하여 업로드"