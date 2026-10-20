# 서버 없는 변경 알림 동기화 — 2026-10-14

사용자는 별도 서버 사용을 원하지 않는다. Cloudflare/APNs 제공자 서버나 비밀 키를 추가하지 않는다. 기존 CloudKit 개인 데이터베이스를 유지한다.

## 구현

- `focus-state-changes-v1` CKQuerySubscription: NeowFocusState 생성/변경/삭제, content-available silent notification.
- Mac: Electron APNs 수신 → preload 이벤트 → 공통 FocusReplicator. 5초 반복 조회 삭제. 앱 복귀/로컬 변경/수동 재시도는 유지.
- iOS: Expo app delegate subscriber → foreground JS 변경 알림. 10초 반복 조회 삭제. 앱 복귀/로컬 변경/수동 재시도 유지.
- iOS 백그라운드: 같은 세션이며 원격 revision/updatedAt이 오래되지 않고, 미처리 위젯 명령/동기화 대기가 없을 때 기존 Live Activity와 위젯 스냅샷·완료 알림 예약 갱신. JS 공통 기록 저장소는 덮어쓰지 않고 다음 앱 복귀 때 전체 병합한다.
- Push entitlement와 remote-notification background mode 추가. 별도 APNs 인증 키 없음. Mac 스토어 프로파일을 자동 갱신해 production push entitlement 확인.

## 한계

CloudKit background notification은 iOS에 의해 지연/생략될 수 있다. 실시간 전파 보장이나 강제 종료 상태 수신 보장을 하지 않는다. PC에서 새로 시작한 집중을 잠긴 iPhone의 새 Live Activity로 시작하는 기능은 미구현이다. 이를 지원하려면 ActivityKit push-to-start 제공자 서버가 필요하다. 이미 표시 중인 같은 집중의 갱신만 지원한다. 동기화를 끄면 수신 이벤트와 스냅샷 적용을 무시한다. CloudKit 구독은 같은 계정의 다른 기기를 위해 삭제하지 않는다.

## 완료 피드백

- iPhone이 집중 종료를 확인하고 앱이 active이면 성공 햅틱 + 시스템 완료음.
- 백그라운드에서는 세션 ID 하나의 예약 로컬 알림(default sound).
- PC에서 시작했더라도 iPhone으로 동기화된 집중에는 이 iPhone의 알림 설정 적용.
- 무음/집중 모드/알림·햅틱 설정은 OS 정책을 따른다. 강제로 소리를 재생하지 않는다.
- 완료 화면에 발도장 밝기 애니메이션 추가. 동작 줄이기/백그라운드에서는 정지.

## 디자인 결정

모바일 타이머는 원형 중심을 유지하고 비율만 정교하게 다듬기로 사용자 선택. 업로드된 빌드 4는 기존 타이머를 유지한다. 이후 사용자 선택에 따라 앱 소스와 `docs/design-review/desktop/mobile-timer.html`에 링 두께 22, 바늘 길이 반지름의 55%를 반영했다. 일시정지·마치기 위치는 변경하지 않았다. 이 비율 변경은 iOS 0.1.0 (5)에 포함해 TestFlight 업로드 성공을 확인했다. Apple 처리·테스터 노출은 별도 확인이 필요하다.

## 검증

- 모바일/PC 타입 검사 통과.
- PC 34 tests 통과. 변경 알림 수신, 5초 조회 제거, 연결 해제 시 리스너 해제 테스트 포함.
- 실제 iPhone background notification 수신/잠금화면 업데이트/소리·진동은 새 빌드 실기기 확인이 필요하다.
- iOS 0.1.0(4) 아카이브 진행, Mac 1.3.3 TestFlight 업로드 진행. 성공 여부는 최종 로그 확인 후 추가한다.

## Apple 근거

- https://developer.apple.com/documentation/cloudkit/cksubscription/notificationinfo-swift.class/shouldsendcontentavailable
- https://developer.apple.com/documentation/activitykit/starting-and-updating-live-activities-with-activitykit-push-notifications

## 배포 확인

Mac 1.3.3(1.3.3): 01:14 KST Upload succeeded / EXPORT SUCCEEDED. iOS 0.1.0(4): ARCHIVE SUCCEEDED 및 Uploaded NeowFocus / EXPORT SUCCEEDED 확인. ReactNativeDependencies 및 hermesvm dSYM 누락 경고가 있으나 업로드 성공. Apple 처리·테스터 노출 및 실제 iPhone 검증은 별도.
