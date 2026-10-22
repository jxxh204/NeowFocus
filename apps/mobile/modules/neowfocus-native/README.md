# iOS 네이티브 연동

`index.ts`가 React Native와 Swift 사이의 계약이다. Expo Go와 web에는 모듈이 없으므로 `null`을 반환하며 기능을 가짜로 활성화하지 않는다.

## 구현 범위

- `ios/FocusShared.swift`: App Group의 JSON snapshot과 widget command queue. 파일 잠금과 atomic write로 앱과 확장 동시 쓰기를 직렬화한다. 위젯 명령은 앱이 상태 저장을 끝내고 `acknowledgeCommands`를 호출하기 전까지 남는다. 미처리 명령이 있으면 앱의 snapshot으로 덮어쓰지 않는다.
- `ios/NeowFocusNativeModule.swift`: Expo local module, snapshot → 위젯 timeline/Live Activity 전달.
- `native-sources/NeowFocusWidgets`: small/medium 홈 위젯과 잠금화면 Live Activity. 기존 SVG의 고양이·발바닥 path와 차콜/흰색을 사용한다. 큰 원형 진행 표시, 보조 숫자 시간. 중형 위젯 pause/resume은 iOS 17 이상 AppIntent로 로컬 snapshot과 command queue를 갱신한다.
- `ios/CloudStore.swift`: 개인 CloudKit 기본 zone의 `NeowFocusState` / `focus-state-v1` record, `json` 필드. 내용은 core sync envelope를 그대로 저장한다. read의 changeTag를 다음 write에 보내야 하며 초기 create는 null이다. CAS 충돌은 `CLOUD_CONFLICT`로 거부하며 자동 덮어쓰지 않는다. 900 KB를 넘으면 오류를 반환한다.
- iOS 앱 차단/Screen Time 연동은 2026-10-17 삭제했다. 권한을 끄는 것만으로는 바이너리에서 API가 빠지지 않아, Swift 소스·framework 링크·bridge·picker·monitor 및 사용할 수 없던 설정 문구를 제거했다.

## 빌드

`app.json`의 `./plugins/withNeowFocusNative.cjs`가 네이티브 확장 타깃, 공유 소스 복사, entitlements를 생성한다. `ios/`만 직접 수정하면 다음 prebuild에서 사라진다. 이 폴더의 `ios/`는 저작 소스이므로 추적해야 한다. `apps/mobile/.gitignore`의 `/ios/`는 앱 바로 아래 생성 결과만 무시한다.

```sh
# apps/mobile에서
pnpm exec expo prebuild --platform ios --no-install
cd ios
pod install
cd ..
xcodebuild -workspace ios/NeowFocus.xcworkspace -scheme NeowFocus \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build-output/DerivedData-native CODE_SIGNING_ALLOWED=NO build
```

- App Group: `group.com.neowfocus.pomodorotimer` — 앱과 widget extension 모두 필요.
- iCloud container: `iCloud.com.neowfocus.pomodorotimer` — 앱과 위젯에 필요, 맥과 같은 container로 연결.
- Widget bundle ID: `com.neowfocus.pomodorotimer.widgets`.
- Widget/Live Activity 최소 iOS 16.4, 위젯 직접 조작 iOS 17.0.
- 배포 전 Apple Developer App IDs와 각 프로비저닝 프로파일에 위 권한을 실제 등록해야 한다. 시뮬레이터 빌드는 이 승인을 검증하지 않는다.

## 실제 동작 한계와 남은 검증

- 현재 Live Activity는 앱이 전경에서 시작한 집중을 로컬 생성하고 갱신한다. 원격 APNs activity token 등록 및 push-to-start 서버는 이 모듈에 없다. **잠긴 폰에서 맥의 시작을 받아 새 Live Activity를 만드는 경로는 구현 완료가 아니다.**
- 앱이 suspended여도 `Text(timerInterval:)` 숫자는 시스템 시간이 흐른다. 위젯 원형 진행률은 분 단위 timeline entry로 변하며 전달 시점은 iOS가 결정한다. 원형 진행을 매초 재그리지 않는다.
- LiveActivity content에서 전체 sync envelope 등 큰 메타데이터를 제외하여 ActivityKit payload 제한을 지킨다.
- 종료 시각은 staleDate로 전달하고 잠금화면은 stale 상태에 완료를 표시한다. 완료 Activity의 5분 후 dismissal은 앱이 완료 처리를 실행한 경우에만 요청한다. 백그라운드 종료 시각에 JS가 실행되거나 Activity가 자동 제거된다고 보장하지 않는다.
- 위젯 명령은 로컬에서 먼저 저장한다. 동기화를 켠 경우 AppIntent가 CloudKit envelope의 `state.nativeCommands`에 command와 baseSession을 추가하고 CAS 충돌을 최대 3회 재시도한다. 성공하면 실행 중인 맥이 다음 read에서 적용할 수 있다. 실패하면 명령은 로컬 queue에 남고 위젯에 `연결되면 반영`을 표시한다. 앱 복귀 때 core 상태로 replay/저장 후 ack한다. AppIntent 실행·네트워크 예산 때문에 즉시 배달은 보장하지 않는다. 실기기 검증이 필요하다.
- `notifyOnCompletion`은 집중을 시작한 폰일 때만 true로 전달한다. 위젯 pause는 기존 sessionId 알림을 취소하고 resume은 같은 id로 재예약한다. 이 확장 경로의 알림 권한/예약은 실기기에서 검증해야 한다.
- 잠금화면의 작업명은 `showTaskOnLockScreen` true일 때만 표시한다. 본문 UI/알림도 같은 개인 정보 설정을 유지해야 한다.
- CloudKit account/error/conflict 응답을 JS가 상태로 표시한다. 앱 bridge의 foreground read/write와 위젯 직접 조작 시 outbound write를 제공한다. 휴대폰으로 들어오는 원격 변경의 백그라운드 realtime 배달은 아직 구현하지 않았다.

## 선택형 냐우캘린더 연동 (2026-10-22)

- 기존 CloudKit 문서에는 완료한 집중 목록도 포함된다. `syncEnabled`를 켜면 같은 Apple 계정의 개인 데이터베이스에 저장한다. 첫 읽기가 실패하면 빈 로컬 상태를 원격에 덮어쓰지 않는다.
- `FocusCalendar.swift`는 EventKit actor로 동작한다. 설정의 ‘냐우캘린더 연동’은 기본 꺼짐이며, 켤 때만 캘린더 전체 접근을 요청한다. 기존 하루 일정을 찾아 갱신하고 전용 캘린더를 만들기 위해 전체 접근이 필요하다. 연결하면 iCloud 동기화도 켜진다.
- iCloud CalDAV source를 확인한 뒤 전용 `냐우포커스` 캘린더를 만든다. iCloud 캘린더가 없거나 확인할 수 없으면 안내 오류를 반환한다. Google/Exchange/기기 전용 캘린더로 자동 대체하지 않는다.
- `focusCalendarDays`는 완료일의 기기 현지 날짜별로 실제 집중 시간을 합산한다. 수동 마침도 한 번으로 세고 충돌로 제외한 기록은 세지 않는다. 제목 예: `냐우포커스 · 3회 · 1시간 25분`. 작업 이름은 전송하지 않는다.
- `neowfocus://daily/YYYY-MM-DD` URL이 일치하는 자체 생성 일정만 갱신·삭제한다. 기록 삭제·복원은 같은 날짜 합계를 갱신한다. 다른 일정과 캘린더는 삭제하지 않는다. 연동을 끄면 기존 일정은 남는다.
- 앱이 실행 중이거나 다시 열렸을 때 iCloud 상태 병합을 먼저 마친 뒤 일정을 갱신한다. 오프라인/충돌 중에는 갱신을 기다린다. iOS 백그라운드 즉시 실행, EventKit의 다른 기기 반영 시각은 보장하지 않는다.
- 냐우캘린더의 iPhone 캘린더 연결에서 접근을 허용하고 캘린더를 선택하면, 기존 선택과 함께 전용 캘린더의 NeowFocus URL 일정도 읽기 전용으로 표시한다. 두 앱의 업데이트가 필요하다. 일정의 URL을 열면 해당 날짜의 집중 목록으로 이동한다.

검증: core 84 tests, 모바일 타입 검사·타이머 스타일/완료 분기·고양이 진입 geometry 검사, Calendar 타입 검사·lint 및 캘린더 연결 27 tests 통과. Swift 단독 iOS simulator SDK typecheck 및 config plugin 권한 키 생성 확인. 기존 시뮬레이터 설치본의 물 스타일 1분 자연 종료는 물 배경을 유지했으며 `docs/implementation/focus-calendar-evidence/water-natural-completion.png`에 저장했다. 보고된 자동 블록 전환은 이 조건에서 재현되지 않았고, 잘못된 스타일 값이 블록으로 처리되는 fallback은 제거했다. TestFlight 모바일 앱에서 발생했다는 사용자 확인을 받은 뒤, 완료 화면이 직전 진행 중 스타일을 별도로 유지하도록 보강하고 설정값이 달라져도 배경을 유지하는 회귀 검사를 추가했다. 실계정 iCloud 저장·복원 및 두 앱 사이의 일정 반영은 아직 확인하지 않았다. 이 변경은 기존 TestFlight 0.1.1(13)에 포함되어 있지 않다.

최종 로컬 검증: `calendar-simulator-signed-build.log`의 `BUILD SUCCEEDED` 확인. Xcode 테스트 서명으로 App Group을 포함해 설치한 새 Release 앱에서 물 스타일 1분 자연 종료 후 물 배경 유지, 연결 설정 기본 꺼짐, 날짜 링크의 기록 시트 열기를 확인했다. `docs/implementation/focus-calendar-evidence/validation.json`에 소스 커밋·번들 해시·검증 범위를 기록했다. Calendar의 임시 체크아웃 변경은 같은 폴더의 패치에도 보관했다. 이 소스 변경은 로컬 커밋만 했으며 GitHub push, 새 TestFlight 업로드, 실계정 두 앱 연동 검증은 수행하지 않았다.

근거: [Apple EventKit 접근](https://developer.apple.com/documentation/eventkit/accessing-calendar-using-eventkit-and-eventkitui), [캘린더 전체 접근 요청](https://developer.apple.com/documentation/eventkit/ekeventstore/requestfullaccesstoevents(completion:)), [Expo Calendar SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/calendar/).

## Screen Time 없는 출시 빌드

현재 iOS 앱과 위젯은 FamilyControls/ManagedSettings/DeviceActivity API 및 entitlement를 사용하지 않는다. 위젯·Live Activity·선택형 CloudKit·집중 타이머는 유지한다. `app.json`의 런타임 false만으로 제한 API를 제거한 것으로 판단하지 않는다.

podspec에서 세 framework를 제거한 뒤 `pod install --no-repo-update`로 CocoaPods의 source 목록과 linker flags도 재생성한다. 출시 아카이브를 만든 후 아래 검사를 통과해야 한다. 앱과 모든 확장의 실제 바이너리, 모든 동봉 Mach-O 링크, 서명 entitlement 및 extension point를 검사한다.

```sh
python3 scripts/verify-screen-time-free.py build-output/NeowFocus-0.1.0-10.xcarchive
```

## 근거

- [Expo local module과 자동 연결](https://docs.expo.dev/modules/autolinking/)
- [Apple Live Activity 표시와 갱신](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities)
- [Family Controls 배포 승인](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)
- [DeviceActivity 최소 15분](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter/monitoringerror/intervaltooshort)

검증 기록 (2026-10-13):

- Swift 소스 단독 iOS 16.4 simulator SDK typecheck 통과.
- Expo prebuild, NeowFocusNative CocoaPods 자동 연결 통과.
- plugin 연속 2회 실행 후 Xcode project 동일성 확인(확장/소스 중복 없음).
- 앱과 WidgetKit extension 전체 arm64 simulator build 성공: `apps/mobile/build-output/native-build-verified.log`의 `BUILD SUCCEEDED`.
- 빌드 결과: `apps/mobile/build-output/DerivedData-native/Build/Products/Debug-iphonesimulator/NeowFocus.app`.
- `simctl list devices booted` 결과 이미 부팅된 시뮬레이터가 없어 설치/실행 검증하지 않았다. 실기기 CloudKit, 위젯 조작, Live Activity, Family Controls와 배포 승인은 미검증이다.
- 이번 변경으로 새 archive나 TestFlight upload를 실행하지 않았다. 기존 0.1.0(1) 업로드와 구분한다.
