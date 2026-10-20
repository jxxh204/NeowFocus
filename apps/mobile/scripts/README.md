# iOS TestFlight 배포

기존 설정: bundle ID `com.neowfocus.pomodorotimer`, team `L67FAG9382`, version `0.1.0`.

모바일 앱은 현재 로컬 집중 MVP다. 데스크톱 실시간 동기화 및 네이티브 위젯을 제공하는 배포본으로 안내하지 않는다.

## 준비

1. Xcode Settings → Accounts에 해당 Apple 개발 팀 계정이 있어야 한다.
2. 모바일 폴더에서 `pnpm exec expo prebuild --platform ios --no-install` 실행.
3. `cd ios && pod install` 실행 후 모바일 폴더로 복귀.
4. `pnpm typecheck`, 루트에서 `pnpm --filter @neowfocus/core test` 실행.

## 배포

- `./scripts/archive-ios.sh`: Release 아카이브 생성
- `./scripts/upload-testflight.sh`: App Store Connect 업로드
- 아카이브: `build-output/NeowFocus.xcarchive`
- 업로드 성공 후 Apple 처리 완료와 TestFlight 테스트 그룹의 접근 가능 상태를 별도 확인한다.

`TestFlight.plist`는 기존 팀 자동 서명과 빌드 번호 관리를 사용한다. 공개 App Store 심사 제출은 수행하지 않는다.

## 로컬 알림 권한

현재 앱은 서버 푸시가 아닌 로컬 완료 알림만 쓴다. `withLocalNotificationsOnly.cjs`를 plugins 배열 첫 번째에 배치한다. Expo의 entitlement mod 실행 순서상 이 위치에서 마지막 결과의 `aps-environment`를 제거한다. 순서를 바꾸면 `expo-notifications`가 원격 푸시 권한을 다시 추가할 수 있다.

`pnpm exec expo config --type introspect --json`의 `_internal.modResults.ios.entitlements`에서 해당 키가 없음을 확인했다. 추후 원격 푸시를 추가할 때에는 이 플러그인을 제거하고 올바른 APNs 프로파일을 설정해야 한다.
