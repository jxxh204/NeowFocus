#!/bin/bash

# NeowFocus TestFlight 자동 배포 스크립트
# macOS 알림과 함께 전체 배포 프로세스를 자동화합니다.

set -e  # 에러 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 알림 함수
notify() {
  local title="$1"
  local message="$2"
  local sound="${3:-Glass}"

  echo -e "${GREEN}🔔 $title${NC}"
  echo -e "   $message"

  # macOS 알림
  osascript -e "display notification \"$message\" with title \"NeowFocus 배포\" subtitle \"$title\" sound name \"$sound\""
}

error_notify() {
  local title="$1"
  local message="$2"

  echo -e "${RED}❌ $title${NC}"
  echo -e "   $message"

  osascript -e "display notification \"$message\" with title \"NeowFocus 배포 실패\" subtitle \"$title\" sound name \"Basso\""
}

success_notify() {
  local title="$1"
  local message="$2"

  echo -e "${GREEN}✅ $title${NC}"
  echo -e "   $message"

  osascript -e "display notification \"$message\" with title \"NeowFocus 배포 성공\" subtitle \"$title\" sound name \"Hero\""
}

# 타이머 시작
START_TIME=$(date +%s)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 NeowFocus TestFlight 배포 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1단계: 이전 빌드 정리
notify "1/6 빌드 정리" "이전 빌드 디렉토리를 삭제합니다..."
if [ -d "dist" ]; then
  rm -rf dist/
  echo "   ✓ dist/ 디렉토리 삭제됨"
fi
sleep 1

# 2단계: MAS 빌드
notify "2/6 빌드 시작" "Mac App Store용 빌드를 생성합니다..."
echo ""
if npm run build:mas; then
  # 빌드 버전 확인
  VERSION=$(node -p "require('./package.json').version")
  notify "빌드 완료" "버전 $VERSION 빌드가 완료되었습니다!" "Ping"
else
  error_notify "빌드 실패" "빌드 중 오류가 발생했습니다."
  exit 1
fi
echo ""

# 3단계: 빌드 검증
notify "3/6 빌드 검증" "서명 및 entitlements를 확인합니다..."
echo ""
if ./scripts/verify-mas-build.sh; then
  notify "검증 완료" "모든 검증을 통과했습니다!" "Ping"
else
  error_notify "검증 실패" "빌드 검증에 실패했습니다."
  exit 1
fi
echo ""

# 4단계: PKG 생성
notify "4/6 PKG 생성" "인스톨러 패키지를 생성합니다..."
PKG_FILE="dist/NeowFocus-${VERSION}-mas.pkg"

if productbuild --component dist/mas-universal/NeowFocus.app /Applications \
  --sign "3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)" \
  "$PKG_FILE"; then

  PKG_SIZE=$(du -h "$PKG_FILE" | cut -f1)
  notify "PKG 생성 완료" "파일 크기: $PKG_SIZE" "Ping"
else
  error_notify "PKG 생성 실패" "인스톨러 패키지 생성에 실패했습니다."
  exit 1
fi
echo ""

# 5단계: Transporter로 업로드
notify "5/6 업로드 시작" "App Store Connect에 업로드합니다..."
echo ""
echo "📦 Transporter를 실행합니다..."
echo "   파일: $PKG_FILE"
echo ""

# Transporter CLI가 있는지 확인
if command -v xcrun altool &> /dev/null; then
  echo "⚠️  altool은 더 이상 사용되지 않습니다."
  echo "   Transporter 앱을 사용하여 수동으로 업로드해주세요."
  echo ""
  echo "   1. Transporter 앱 실행"
  echo "   2. $PKG_FILE 드래그"
  echo "   3. '전달' 클릭"
  echo ""

  # Transporter 앱 열기
  open -a "Transporter" "$PKG_FILE" 2>/dev/null || true

  notify "Transporter 실행" "파일을 드래그하여 업로드하세요." "Purr"

  echo "   업로드가 완료되면 Enter를 눌러주세요..."
  read -r

else
  # Transporter 앱만 열기
  echo "   Transporter 앱을 실행합니다..."
  open -a "Transporter" "$PKG_FILE" 2>/dev/null || {
    error_notify "Transporter 없음" "Transporter 앱을 찾을 수 없습니다."
    echo ""
    echo "   App Store에서 Transporter를 다운로드하세요:"
    echo "   https://apps.apple.com/app/transporter/id1450874784"
    exit 1
  }

  notify "Transporter 실행" "파일을 드래그하여 업로드하세요." "Purr"

  echo "   업로드가 완료되면 Enter를 눌러주세요..."
  read -r
fi

echo ""
notify "업로드 완료" "App Store Connect 처리 중..." "Ping"

# 6단계: 완료
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success_notify "배포 완료!" "버전 $VERSION이 TestFlight에 제출되었습니다."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 빌드 버전: $VERSION"
echo "✅ PKG 파일: $PKG_FILE"
echo "✅ 소요 시간: ${MINUTES}분 ${SECONDS}초"
echo ""
echo "📱 다음 단계:"
echo "   1. App Store Connect에서 빌드 처리 대기 (15-30분)"
echo "   2. 빌드 상태가 '검증됨'으로 변경되면 TestFlight 사용 가능"
echo "   3. TestFlight에서 앱 다운로드 및 테스트"
echo ""
echo "🔗 App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps"
echo ""

# App Store Connect 열기 (선택)
read -p "App Store Connect를 열까요? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  open "https://appstoreconnect.apple.com/apps"
fi

echo ""
echo "🎉 배포 프로세스가 완료되었습니다!"
echo ""
