# Dock 아이콘을 유지하는 전체 화면 패널 — 2026-10-18

## 구현

사용자 요청: Dock 아이콘을 유지하면서 다른 앱의 전체 화면 위에도 표시. 기존 디자인 유지.

- macOS에서 기존 BrowserWindow를 Electron 28의 `type: panel`로 생성한다. Electron의 `ElectronNSPanel`은 nonactivating 스타일과 `canJoinAllSpaces / fullScreenAuxiliary`를 적용한다. 앱은 regular activation policy를 유지하며 `app.dock.hide()`나 LSUIElement를 추가하지 않는다.
- 전체 화면 표시와 `skipTransformProcessType: true`를 유지한다. 원래 일반 NSWindow에서 필요한 앱 유형 전환을 건너뛰던 문제를 native panel로 해결한다.
- `screen-saver + 1` 대신 `floating` 레벨을 사용해 앱 본문 위에 표시하고 Dock·시스템 메뉴 아래에 둔다. 강제로 100ms 뒤 다시 focus하던 타이머를 제거한다.
- show/hide 복귀는 `revealWindow`로 모은다. macOS에서는 showInactive 뒤 panel.focus를 사용해 다른 앱의 전체 화면을 활성화한 채 입력할 수 있게 한다. Dock 메뉴·트레이 메뉴·설정 메뉴·IPC·기존 showWindow 호출이 같은 경로를 사용한다. 최소화 상태도 복구한다.
- 트레이 메뉴를 열 때 최상위 상태를 해제했다가 타이머로 복원하던 코드를 제거한다. floating은 메뉴 아래이므로 일시적으로 고정을 풀 필요가 없다.
- 렌더러/스타일/아이콘/모바일 소스는 이번 변경에서 수정하지 않았다. 제출한 1.3.7 스테이징 렌더러와 새 빌드의 모든 파일 SHA-256이 동일하다.

## 검증 결과

- `pnpm run typecheck` 통과, production `pnpm run build` 통과.
- 기존 PC 테스트 6 suites / 43 tests 통과. 새 단순 mock 테스트는 추가하지 않았다.
- 실제 Mac, Electron 28.3.3에서 별도 임시 사용자 데이터로 실제 앱 main/renderer를 실행했다. 기존 설치 앱/기록과 분리했다.
- 개인 문서 대신 별도 AppKit 테스트 앱을 만들고 CUA에서 녹색 전체 화면 버튼으로 macOS의 별도 full-screen Space에 진입했다.
- 다른 앱이 `fullScreen=true`, `active=true`인 동안 앱 자체 native window를 읽어 `ElectronNSPanel`, `nonactivatingPanel=true`, `onActiveSpace=true`, `fullScreenAuxiliary=true`, `canJoinAllSpaces=true`, `visible=true`, `activationPolicy=0(regular)`, `level=3(floating)`와 `app.dock.isVisible()=true`를 확인했다. [동시 실행 증거](evidence/fullscreen-panel/active-fullscreen-runtime.json).
- 전체 화면 위에서 작업 이름 입력·타이머 시작·작은 창 320×36 전환·클릭 복귀·Cmd+, 설정 이동을 확인했다. 기존 화면 렌더러를 사용한다. [집중 화면](evidence/fullscreen-panel/focus-window.png).
- Cmd+W 직후 native `visible=false`, `focused=false`, Dock은 true임을 확인했다. 상태 조회 도구가 앱을 다시 활성화해 숨긴 창을 재표시하는 영향이 있어, 숨김 확인은 조회 전 자체 상태 파일로 검증했다. 별도 단축키 가로채기는 필요 없어 최종 코드에 넣지 않았다. [숨김 상태](evidence/fullscreen-panel/hidden-runtime.json).
- 검증용 Electron/전체 화면 fixture는 종료했다. 기존 `/Applications/NeowFocus.app`와 사용자 데이터는 교체하지 않았다.

## 배포와 남은 확인

2026-10-18 17:44:27 KST 사용자 요청으로 이 변경을 포함한 macOS **1.3.8 (1.3.8)** universal MAS 앱을 새로 패키징·배포 서명·검증하고 TestFlight 업로드했다. `Upload succeeded` / `EXPORT SUCCEEDED`, Apple 처리 시작까지 확인했다. 2026-10-19 실제 Mac TestFlight 앱에서 1.3.8 / 빌드 1.3.8과 ‘업데이트’ 버튼을 확인해 Apple 처리 완료·현재 테스터 계정 설치 가능 상태를 검증했다. 웹 로그인 만료로 그룹 할당 세부 정보는 조회하지 않았다. [TestFlight 기록](../release/2026-10-18/testflight-1.3.8/README.md). 기존 공개 심사 PC 1.3.7 및 iOS 제출은 이번 작업에서 수정하지 않았다.

실제 Mac 실행 검증은 개발 Electron으로 했으며 새 서명 앱의 TestFlight 설치 후 동작은 아직 미확인이다. 현재 Mac 한 대에서 검증했으며 모든 macOS 버전·모든 전체 화면 앱 조합을 보증하지 않는다. App Store 심사 통과를 의미하지 않는다.

## 근거

- [Electron 28.3.3 native panel 생성](https://github.com/electron/electron/blob/v28.3.3/shell/browser/ui/cocoa/electron_native_widget_mac.mm)
- [ElectronNSPanel 스타일 및 Space 동작](https://github.com/electron/electron/blob/v28.3.3/shell/browser/ui/cocoa/electron_ns_panel.mm)
- [Electron 창 API](https://www.electronjs.org/docs/latest/api/browser-window#winsetvisibleonallworkspacesvisible-options)

검증용 fixture·자체 창 정보 조회 모듈과 런처는 `apps/desktop/build-output/fullscreen-validation/`에 보관한다. 정보 조회 모듈은 자신의 NSView/NSWindow만 읽으며 제품에 포함하지 않는다. 렌더러 동일성은 [renderer-unchanged.json](evidence/fullscreen-panel/renderer-unchanged.json), 최종 native 상태는 [final-runtime.json](evidence/fullscreen-panel/final-runtime.json).
