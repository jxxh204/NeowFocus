# iOS 0.1.1(13) — 타이머 스타일 TestFlight

상태: **TestFlight 업로드·Apple 처리 완료 / 기존 내부 그룹 배포 확인**. 2026-10-22 14:37 KST `Upload succeeded`, `Uploaded NeowFocus`, `EXPORT SUCCEEDED`, 종료 코드 0을 확인했다.

- 요청: 승인한 모바일 타이머 스타일을 TestFlight에 업로드.
- 소스: `feat/mobile-timer-styles`, `9ee924b059c57e30d7796773fdc7ad278877c018` (기능 구현 `24fe575`).
- 현재 App Store Connect에서 기존 iOS `0.1.0(12)`는 **배포 준비됨**으로 확인했다. 다음 버전은 `0.1.1`, 빌드는 `13`으로 준비했다.
- 기존 TestFlight 내부 그룹: **더기와 쟈니들**. 새 그룹/테스터를 생성하지 않는다.
- 공개 App Store 새 버전 심사 제출은 이번 요청 범위에 포함하지 않는다.

## 변경사항과 검증

- 기존 원형 / 전체 화면 블록 / 두 겹 물 타이머.
- 승인한 설정 목록과 남은 시간 표시 선택, 스타일 저장.
- 화면 탭으로 두 버튼만 있는 반투명 바텀시트.
- 진행 시간·일시정지·재실행 복원. 기존 고양이·발자국·휴식·동기화 흐름 유지.
- 모바일 TypeScript, 스타일 검증, 기존 공통 로직 79개, 기존 고양이 기하 검증 48개 통과. 새 iOS 번들로 시뮬레이터 기능을 확인했다. [구현과 화면 근거](../../../mobile-timer-styles/README.md).
- 실제 앱/위젯 모두 0.1.1(13), 서명 deep/strict와 동봉 Mach-O 10개 검사 통과. Screen Time framework/권한/확장 제거, 새 스타일 속성·자동 휴식·상태 저장 키와 승인 픽셀 고양이 원본 SHA-256 일치를 확인했다. [기능 검사](archive-feature-audit.json), [API/서명 검사](screen-time-audit.json).

## 배포 결과

- 아카이브: `apps/mobile/build-output/NeowFocus-0.1.1-13.xcarchive`.
- 빌드/업로드 로그: `apps/mobile/build-output/archive-0.1.1-13.log`, `apps/mobile/build-output/upload-0.1.1-13.log`.
- 업로드: 2026-10-22 14:37:16 KST 성공. Apple 응답 `Uploaded package is processing.`.
- Apple 처리 완료. App Store Connect의 새 버전 0.1.1 / 빌드 13과 **더기와 쟈니들 / 내부 / 테스터 2명** 연결을 확인했다. 한국어 테스트 안내를 저장했고 `저장 완료`를 확인했다.
- [실제 TestFlight 빌드](https://appstoreconnect.apple.com/teams/e5ec510c-eb5f-47f1-99e1-31e2ce1e77cc/apps/6751244958/testflight/ios/1f087b77-0990-44ed-8354-ff3aa81b188a).
- 근거: [처리·그룹 목록](evidence/ios-build13-processed-group.png), [테스트 안내 저장·그룹 접근](evidence/ios-build13-notes-and-group.png), [상태 기록](release-status.json).
- React / ReactNativeDependencies / hermesvm framework의 dSYM 업로드 경고가 있다. 업로드는 완료됐으며 해당 framework 크래시의 심볼 분석에는 제한이 남는다.
- 실물 iPhone 설치/동작 확인은 별도다.
