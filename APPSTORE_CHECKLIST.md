# 🍎 앱스토어 배포 체크리스트

## 1. Apple Developer 준비사항 ✅

### 계정 및 인증서
- [ ] Apple Developer Program 가입 ($99/년)
- [ ] Team ID 확인
- [ ] 인증서 생성:
  - [ ] Mac App Distribution Certificate
  - [ ] Mac Installer Distribution Certificate
  - [ ] Developer ID Application (테스트용)
  - [ ] Developer ID Installer (테스트용)

### 앱 등록
- [ ] App Store Connect에서 앱 생성
- [ ] Bundle ID 등록: `com.neowfocus.pomodorotimer`
- [ ] 앱 이름 예약: "NeowFocus"

## 2. 앱 아이콘 및 리소스 준비 📦

### 아이콘 (필수)
- [ ] icon.icns 파일 생성 (1024x1024 원본 필요)
- [ ] 다음 크기 포함:
  - 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

### 스크린샷 (필수)
- [ ] 2880x1800 (5K 디스플레이)
- [ ] 2560x1600 (MacBook Pro 16")
- [ ] 최소 3장, 최대 10장

## 3. 메타데이터 준비 📝

### 앱 정보
- [ ] 앱 이름: NeowFocus
- [ ] 부제목 (30자): "귀여운 고양이와 함께하는 뽀모도로 타이머"
- [ ] 카테고리: Productivity
- [ ] 연령 등급: 4+
- [ ] 가격: 무료/유료 결정

### 설명문
- [ ] 짧은 설명 (170자)
- [ ] 긴 설명 (4000자)
- [ ] 키워드 (100자)
- [ ] 새로운 기능 (업데이트 시)

### 지원 정보
- [ ] 지원 URL
- [ ] 개인정보 처리방침 URL
- [ ] 마케팅 URL (선택)

## 4. 코드 서명 및 빌드 설정 🔐

### 환경변수 설정 (.env.local)
```bash
APPLE_ID=your-apple-id@example.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=certificate-password
```

### electron-builder.yml 확인
- [x] appId 설정: `com.neowfocus.pomodorotimer`
- [x] 카테고리: `public.app-category.productivity`
- [x] entitlements 파일 생성
- [x] mas target 추가
- [ ] Team ID 입력

## 5. 빌드 및 테스트 🔨

### 로컬 테스트
```bash
# 개발 인증서로 테스트
npm run build:mac

# 앱 실행 테스트
open dist/mac/NeowFocus.app
```

### 앱스토어 빌드
```bash
# MAS (Mac App Store) 빌드
npm run build:mas

# 결과물 확인
ls -la dist/mas/
```

## 6. 앱 심사 준비 📋

### 필수 확인사항
- [ ] 앱이 macOS 10.13+ 지원
- [ ] 샌드박스 모드 정상 동작
- [ ] 크래시 없음
- [ ] 네트워크 연결 없이도 기본 기능 동작
- [ ] 사용자 데이터 암호화/보안
- [ ] 개인정보 수집 최소화

### 심사 노트 작성
- [ ] 테스트 계정 (필요시)
- [ ] 특별 설정 방법
- [ ] 주요 기능 설명

## 7. 제출 프로세스 🚀

### Transporter 앱 사용
1. [ ] Transporter 앱 다운로드
2. [ ] .pkg 파일 업로드
3. [ ] 검증 통과 확인

### App Store Connect
1. [ ] 빌드 선택
2. [ ] 메타데이터 최종 확인
3. [ ] 심사 제출
4. [ ] 심사 상태 모니터링 (보통 24-48시간)

## 8. 출시 후 관리 📊

- [ ] 사용자 리뷰 모니터링
- [ ] 크래시 리포트 확인
- [ ] 업데이트 계획 수립
- [ ] 판매 리포트 확인

## 📌 유용한 링크

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer](https://developer.apple.com)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## ⚠️ 주의사항

1. **첫 제출은 시간이 더 걸림** (7-14일)
2. **휴일/연말에는 심사 지연**
3. **리젝 시 상세한 답변 준비**
4. **자동 업데이트 기능 주의** (앱스토어 정책)
5. **외부 결제 링크 금지**