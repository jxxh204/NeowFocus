# iOS TestFlight 배포

기존 설정: bundle ID `com.neowfocus.pomodorotimer`, team `L67FAG9382`, 현재 version/build는 `app.json`에서 관리한다(0.1.1 / 13).

기본 타이머·기록은 로컬에 저장하며, 선택형 iCloud·위젯·Live Activity 구현을 포함한다. 실제 기기에서의 동작 확인과 업로드 완료는 구분한다. [최신 배포 상태](RELEASE-STATUS.md)를 먼저 확인한다.

## 준비

1. Xcode Settings → Accounts에 해당 Apple 개발 팀 계정이 있어야 한다.
2. 모바일 폴더에서 `pnpm exec expo prebuild --platform ios --no-install` 실행.
3. `cd ios && pod install` 실행 후 모바일 폴더로 복귀.
4. `pnpm typecheck`, 루트에서 `pnpm --filter @neowfocus/core test` 실행.

## 배포

- `./scripts/archive-ios.sh`: Release 아카이브 생성
- `./scripts/upload-testflight.sh <검증한 아카이브 경로> [내보내기 폴더]`: 지정한 아카이브를 App Store Connect에 업로드. 경로는 필수이며 실제 이번 배포 경로·명령은 최신 기록을 따른다.
- 아카이브: `build-output/NeowFocus.xcarchive`
- 업로드 성공 후 Apple 처리 완료와 TestFlight 테스트 그룹의 접근 가능 상태를 별도 확인한다.

`TestFlight.plist`는 기존 팀 자동 서명과 빌드 번호 관리를 사용한다. 공개 App Store 심사 제출은 수행하지 않는다.

## 알림·네이티브 권한 검사

완료 알림은 로컬 알림을 사용한다. 현재 `withNeowFocusNative.cjs`는 선택형 iCloud 변경 알림을 위한 push/CloudKit 권한, App Group과 위젯을 구성한다. 권한 구성과 실기기의 실제 알림·동기화 전달 여부는 구분해 확인한다.

배포 아카이브는 `python3 scripts/verify-screen-time-free.py <아카이브 경로>`로 검사한다. 앱/위젯의 Screen Time 관련 framework·바이너리 참조·권한·확장·legacy flag가 없고 서명이 유효한지 확인한 뒤 업로드한다.
