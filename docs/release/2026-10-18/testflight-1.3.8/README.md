# macOS 1.3.8 TestFlight

사용자 요청: Dock 아이콘과 기존 디자인을 유지하면서 다른 앱의 전체 화면 위에도 표시되는 수정본을 TestFlight로 배포한다.

## 빌드 검증

- 버전/빌드: **1.3.8 (1.3.8)**, Electron 28.3.3, x86_64 + arm64 universal MAS 앱.
- Apple Distribution 팀 `L67FAG9382` 서명 및 `codesign --verify --deep --strict` 통과.
- 실제 `app.asar`에서 panel 창, floating 레벨, Dock 표시, 전체 화면 Space 설정 포함 확인.
- 제출한 1.3.7의 렌더러 파일 17개와 SHA-256 모두 동일. [번들 검사](bundle-audit.json), [소스 해시](source-manifest.json).
- 기능 코드 변경 직전 타입 검사·기존 PC 6 suites / 43 tests 통과. [실제 Mac 전체 화면 실행 검증](../../../implementation/fullscreen-panel.md).
- 아카이브: `apps/desktop/build-output/NeowFocus-1.3.8-1.3.8.xcarchive`.
- 로그: `apps/desktop/build-output/{package,sign,upload}-1.3.8.log`.

## 전달 상태

2026-10-18 **17:44:27 KST 업로드 성공** (`Upload succeeded` / `EXPORT SUCCEEDED`) 이후, **2026-10-19 실제 Mac TestFlight 앱에서 NeowFocus 1.3.8 / 빌드 1.3.8과 ‘업데이트’ 버튼, 이 Mac와 호환됨을 확인했다.** Apple 처리 완료 및 현재 테스터 계정의 설치 가능 상태를 직접 확인한 것이다. [화면 증거](evidence/testflight-138-update-available.png), [관찰 기록](evidence/testflight-138-observation.json), [최신 상태](status.json).

App Store Connect 웹은 로그인 만료 상태라 그룹 할당 세부 정보는 조회하지 않았다. 현재 테스터 계정에서 설치 가능한 것은 확인됐으며, 새 버전을 설치·실행하는 작업은 하지 않았다.

기존 공개 심사 제출(PC 1.3.7, iOS 0.1.0 빌드 12)은 이번 배포에서 수정하지 않는다. 새 TestFlight 버전을 설치한 뒤의 실제 실행 확인은 별도다.
