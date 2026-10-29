# 모바일 집중·성취 흐름 구현 인계

기준: `docs/design-review/desktop/focus-achievement-plan.html`, 2026-10-14 사용자 요청. 전체 기획에는 PC와 모바일 변경이 모두 포함된다. 이 문서는 실제로 구현·배포한 모바일 부분을 기록한다. PC가 승인 범위에서 제외된 것이 아니며, PC 집중·성취 화면과 사이트 차단의 현재 구현은 [PC 인계](focus-achievement-desktop.md)를 참고한다.

2026-10-15 범위 정정: PC에도 짧은 첫 안내, 집중 중 숫자 숨김, 오늘 누적 성취, 같은 작업·직전 시간으로 재준비, 작은 창을 잠시 넓힌 하루 요약과 휴식, 사용자 선택 사이트 차단이 기획돼 있다. 정정 당시 PC에는 해당 기능이 빠져 있었으며, 이후 1.3.4 소스에 반영했다. 실제 앱·Chrome 검증과 새 PC 업로드는 남아 있다. 모바일 배포 성공을 전체 기획 완료로 취급하지 않는다.

## 화면과 기록

첫 이용 안내는 한 번만 보이고 기존 설치에는 생략한다. 준비 화면은 할 일과 선택 시간, 실행/일시정지는 할 일과 원형 게이지를 보여준다. 남은 시간 숫자는 숨긴다. 수동 완료도 실제 집중 시간을 보존하고 도장 한 개로 인정한다. 1분 미만 제외 조건을 제거했다. ‘한번 더’는 같은 할 일과 이전 선택 시간으로 준비하며 자동 시작하지 않는다.

‘오늘은 여기까지’에서만 픽셀 고양이가 등장한다. 오늘 완료 기록을 중복 제거하고 동기화 충돌로 종료된 기록은 성취 집계에서 제외한다. 실제 집중 합계와 고유 작업 목록을 보여준다. 계속하기는 준비 화면, 오늘 마무리는 휴식 화면으로 이동한다. 휴식은 당일에만 유지하며 새 집중과 기존 기록은 허용한다.

## 도장·고양이·피드백

집중 한 번 완료는 애니메이션 없이 기존 발자국을 표시한다. 일반 완료의 `Paw`는 `assets/original-paw.ts`의 원본 SVG 전체(외곽 윤곽 포함)를 사용한다. 하루 마무리 전용 `CompletionPaw.tsx`만 `assets/completion-pixel/paw-mask.ts`의 16×16 픽셀 도장을 사용한다. `completionGeometry.ts`에서 스프라이트의 등 기준점과 접촉 앞발 좌표를 공유해 도장 회전과 고양이 위치를 맞춘다. 고양이는 승인된 GPT Image 원본을 8프레임으로 잘라 쓴다. 상하좌우와 네 대각선의 8방향 중 직전 방향을 제외하고 무작위 선택한다. 직전 방향은 설정에 보존하며 앱을 다시 열어도 제외한다. 앞발을 회전 중심으로 삼아 어떤 방향에서도 도장 중심에 닿고, 등 잘림선은 화면 밖에 배치한다. `CompletionCat.tsx`는 진입 한 번, 최대 30번의 횟수 증가 동작, 퇴장 한 번을 재생한다.

일반 집중 완료 화면이 나타날 때 피드백을 요청한다. `FocusProvider.tsx`는 로컬에서 발생한 새 완료만 허용하며 복원·원격 완료·오래된 완료·백그라운드 복귀를 제외한다. 콜백과 650ms 대체 타이머는 같은 요청을 소비해 중복 재생을 막는다. 최신 알림 설정과 앱 활성 상태를 확인한다. iOS는 짧은 시스템 소리와 soft impact 한 번을 사용하고, 알림 소리가 거부된 경우 소리를 생략한다. 하루 마무리에는 추가 피드백이 없다.

동작 줄이기에서는 도장과 최종 횟수만 표시한다. 이미지 로드 실패 시에도 완료 요약에 도달한다.

## 잠금화면·위젯·실행

Live Activity와 위젯은 남은 시간 숫자 대신 게이지를 사용한다. 대기 위젯은 오늘 횟수와 시작 진입을 보여준다. 작업 이름 공개 설정을 따른다. 오늘 집계 메타데이터를 공유 스냅샷에 전달하며 자정 timeline 항목으로 날짜가 바뀐 횟수를 갱신한다.

네이티브 소스는 `modules/neowfocus-native`와 `native-sources/NeowFocusWidgets`에 있다. 생성된 iOS 프로젝트에만 수정하지 않도록 원본을 함께 수정했다. iOS 27 실행을 위해 `withSceneLifecycle.cjs`가 Expo scene delegate를 연결하고, 불필요한 CloudKit database 초기화를 지연한다.

앱 차단 코드는 준비되어 있으나 `familyControls:false`로 유지한다. 현재 배포 프로파일의 Family Controls entitlement 부재를 확인했다. 기존 차단의 최소 15분 제한·일시정지 시 해제·실패 시 허용 정책은 그대로다. Apple 권한 승인과 실제 기기 확인 없이 활성화한 것으로 보고하지 않는다.

## 검증과 재실행

코어 76개, 관련 데스크톱 회귀 15개 테스트 통과. 모바일 타입 검사와 iPhone 17e / iOS 27 Debug 시뮬레이터 빌드 성공. Expo 웹에서 짧은 집중도 도장으로 집계되는지, 일반 완료에 고양이가 없는지, 하루 마무리에만 등장하는지, 휴식 재진입과 기록 유지 확인. 최신 캡처는 `../design-review/mobile-completion/mobile-*-original-paw.png` 및 `iphone-original-paw-current.png`다. 후자는 iPhone 17e 시뮬레이터의 일반 완료 화면으로, 기존 발자국과 애니메이션 부재를 확인했다. 방향/접촉 계산 48개 조합과 원본 SVG 동일성은 `apps/mobile/scripts/check-completion-geometry.cjs`로 검사했다. 웹 캡처를 iPhone 실기기 증거로 취급하지 않는다.

개발 미리보기는 `apps/mobile`에서 `EXPO_OFFLINE=1 pnpm exec expo start --localhost --port 8081`, 별도 안내 화면은 `docs/design-review/mobile-completion`에서 `python3 -m http.server 8771 --bind 127.0.0.1`로 실행한다. CI 모드에서는 변경 감시가 꺼지므로 소스 수정 후 서버를 재시작해야 한다.

실제 iPhone 소리·진동, 잠금화면 및 위젯, 날짜 변경, iCloud 기기간 동기화 검증은 남아 있다. 이 작업에서는 배포 업로드와 실기기 설치를 수행하지 않았다.

독립 동작 미리보기의 8개 방향 버튼은 검토용이다. 앱에는 방향 선택 UI를 추가하지 않으며, 하루 마무리를 누를 때 선택한다. 미리보기의 위치 계산은 `apps/mobile/scripts/export-completion-preview.cjs`가 실제 앱 소스에서 생성한다. 디자인 검사기의 HTML 대비 경고는 상속된 어두운 배경을 흰색으로 가정한 결과이며, 실제 화면의 배경은 #181818 / #272727이다.

최종 승인안 적용: 하루 마무리 도장만 픽셀로 표시하고 일반 완료 원본 아이콘은 유지한다. 타입 검사, `expo export --platform ios`의 Hermes 번들 생성, iPhone 17e Debug 빌드 통과. 웹 앱 실제 흐름을 확인했으며 최신 하루 화면은 `../design-review/mobile-completion/mobile-day-pixel-paw-current.png`다. 실제 iPhone 설치와 TestFlight 업로드는 별도 미수행 상태다.

2026-10-14 배포: 0.1.0(7) Release 아카이브·앱/위젯 버전·픽셀 이미지 및 JS 번들·deep strict 서명 검증 통과. 22:53:38 KST TestFlight 업로드 성공, Apple 처리 중 응답 확인. 아카이브와 업로드 로그는 `apps/mobile/build-output/NeowFocus-0.1.0-7.xcarchive`, `archive-0.1.0-7.log`, `upload-0.1.0-7.log`다. 테스터 표시·실기기 검증 및 프레임워크 dSYM 누락 제한은 `apps/mobile/scripts/RELEASE-STATUS.md`를 따른다. 위의 미배포 설명은 당시 구현 단계 기록이다.
