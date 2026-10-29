# 실기기 피드백 후 수정 — 2026-10-13

## PC 설치

TestFlight에서 1.3.1(1.3.1) 다운로드 → 열기 버튼 전환 확인. `/Applications/NeowFocus.app` 버전 1.3.1 및 앱 설정 화면 실행 확인. 사용자가 보낸 이전 0.1.0(2) 표시와 현재 상태를 구분한다.

## PC 디자인

사용자가 새 PC UI 전부 제거 후 재검토를 요청했다. 소스에서 새 UI를 제거했고 기존 입력/설정/기록 표현으로 되돌렸다. 동기화 핵심 로직은 유지. 타입 검사·production build 통과. 이 상태는 검토 중간본으로 배포 금지. [검토 시안](../design-review/desktop/index.html)과 [인수인계](../design-review/desktop/README.md)를 따른다. 설치된 앱은 여전히 기존 배포 UI이다.

## iCloud 저장 실패

설치 앱의 실제 CloudKit 로그: `Cannot create new type NeowFocusState in production schema`.
출시 스키마 미배포가 원인. 콘솔 인증 및 cktool 토큰이 없어 콘솔 로그인을 사용자에게 요청했다. 서버 수정·성공한 동기화 검증은 아직 없다.

## iOS 잠금화면

- 다크 카드에서 기본 primary/secondary 텍스트가 기기 색상 모드에 따라 검게 렌더링됐다. 흰 상태/시간, 밝은 회색 작업명, 불투명 차콜 배경 지정.
- 작업명 12→14pt, 최대 2줄. 숨김 설정은 그대로 유지.
- 기존 원형 게이지는 Date.now로 계산한 Shape.trim이라 앱이 멈춘 동안 갱신되지 않았다. Live Activity의 running 상태에 시스템 `ProgressView(timerInterval:countsDown:label:currentValueLabel:)` 사용. 구간은 endsAt-durationSeconds...endsAt로 구성해 일시정지 후 재개 비율을 유지한다.
- 홈 위젯은 기존 timeline 갱신 방식을 유지한다. Live Activity와 홈 위젯의 갱신 방식을 혼동하지 않는다.
- 원본 `apps/mobile/native-sources/NeowFocusWidgets/FocusWidgets.swift` 및 생성 프로젝트 복사본 수정.
- 앱 빌드 번호 3으로 올림. 글자 대비 수정 native BUILD SUCCEEDED 확인. 게이지 포함 `archive-0.1.0-3.log` 아카이브 진행 중.
- 실제 잠금 상태의 게이지 갱신은 아직 수정본 실기기 검증 전. 컴파일 성공으로 실기기 확인을 대체하지 않는다.

## 아직 별도인 사항

Family Controls 배포 권한/실기기 차단해제 검증은 미확인, 앱 차단은 비활성. 잠긴 폰에서 PC 변경을 받는 APNs 경로도 미구현. 이번 표시 수정이 이를 해결한 것으로 안내하지 않는다.

## 2026-10-14 사용자 결정

- CloudKit Console 로그인 완료 답변 받음. 출시 스키마 수정 및 확인을 이어갈 수 있다.
- PC 시안 방향 승인. 단, PC 첫 작업 제안은 제거한다. 시안과 PC 컨텍스트에서 제거했으며, 직접 작업 입력 흐름을 유지한다. 모바일 제안은 변경하지 않는다.

## 2026-10-14 적용 및 검증

- PC 첫 제안 제거 완료: 시안에서 추천 행 삭제, TaskContext의 제안 전용 API 및 관련 테스트 삭제. 기존 직접 입력 화면 유지. 모바일/공통 데이터 정책 유지.
- 승인 PC 설정 구현: 402×468, 체크박스 대신 switch, 카드 대신 구분선, 오류 원문과 상단 연결 상태 제거. 기존 시간/색 선택 유지.
- 삭제 취소를 기록 하단 한 줄로 적용, 충돌 선택은 기존 창의 본문으로 적용.
- 웹 타입 검사 통과, 데스크톱 Jest 5 suites / 33 tests 통과.
- 빌드된 renderer를 로컬 browser harness로 확인. Electron IPC만 모의했으며 이 검증은 네이티브 앱 실행 증거가 아니다. 설정 정상/오류 스크린샷 확인, 오류 본문 clientHeight=438 / scrollHeight=438.
- CloudKit Console: Development에 NeowFocusState 타입과 json STRING 생성, 새 타입의 기본 world READ 제외 후 Production 배포. 화면에 Changes Deployed / The schema is deployed to Production 확인. Users 타입 기존 권한 유지.
- 설치된 PC 1.3.1 설정에서 “같은 Apple 계정의 기기와 연결됐어요.” 및 마지막 확인 오전 12:15 확인. 두 기기 간 실제 변경 전파는 별도 실기기 검증 대상.
- iOS 0.1.0(3): ARCHIVE SUCCEEDED 및 Uploaded NeowFocus / EXPORT SUCCEEDED 확인. 잠금화면 대비와 시스템 시간 기반 게이지 포함. Hermes dSYM 누락 경고 있으나 업로드 성공; 실기기 잠금화면 검증은 아직 미완료.
- PC 1.3.2(1.3.2): universal 패키징, Apple Distribution 서명, codesign deep/strict 검증 완료. TestFlight 업로드 진행 중.

## PC 업로드 완료

2026-10-14 00:19 KST, upload-1.3.2.log의 Upload succeeded / Uploaded NeowFocus / EXPORT SUCCEEDED 확인. Apple 패키지 처리 시작까지 확인했으며 테스터 앱의 업데이트 노출·1.3.2 실설치는 아직 별도다. 수정된 PC 설정 확인 이미지는 `docs/design-review/desktop/settings-error-implemented.png`, CloudKit 배포 증거는 같은 폴더 `cloudkit-deployed.png`.
