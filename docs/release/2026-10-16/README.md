# NeowFocus 공개 심사 제출 기록 — 2026-10-16

> 2026-10-17: iOS 빌드 9가 2.5.1로 거절됐다. [최신 수정과 재심사 상태](../2026-10-17/README.md)를 따른다. 아래 표는 10월 16일 제출 당시 기록이다.

사용자가 TestFlight 업데이트가 아닌 **App Store 공개 출시**를 명시적으로 선택했고, PC 디자인 복원 결과를 확인한 뒤 “이 상태로 다시 빌드해서 앱스토어 출시 진행”을 승인했다. 새 대상은 **macOS 1.3.6(1.3.6)** 및 **iOS 0.1.0(9)**다. 기존 앱 ID는 `6751244958`, bundle ID는 `com.neowfocus.pomodorotimer`다.

## 현재 상태 — 공개 심사 대기

| 플랫폼 | 제출 버전 / 빌드 | 제출 시각 (KST) | Apple 상태 |
| --- | --- | --- | --- |
| macOS | 1.3.6 / 1.3.6 | 2026-10-16 21:02 | 심사 대기 중 |
| iOS | 0.1.0 / 9 | 2026-10-16 21:03 | 심사 대기 중 |

두 플랫폼 모두 **승인 후 자동 출시** 설정으로 실제 공개 심사 제출을 마쳤다. `심사를 위해 제출` 실행 후 `1개의 항목 제출됨` 응답과 각 제출 상세의 버전·빌드·심사 대기 상태를 확인했다. 현재는 Apple 심사 대기이며 공개 스토어의 새 버전 노출·사용자 설치·실기기 동작 완료를 뜻하지 않는다. 이전 빌드 8 / Mac 1.3.5를 제출하지 않았다.

- [App Store Connect 심사 목록](https://appstoreconnect.apple.com/apps/6751244958/distribution/reviewsubmissions)
- macOS 제출 ID: `763cc768-0ca8-4f51-8a04-cc1eb29c4753`
- iOS 제출 ID: `0f317a49-c99b-4615-83d2-099e97ee8176`
- 증거: `evidence/app-store-review-submitted.png`, `evidence/macos-1.3.6-waiting-for-review.png`, `evidence/ios-0.1.0-9-waiting-for-review.png`.
- 업로드의 프레임워크 dSYM 누락 경고는 남아 있어 해당 라이브러리 크래시 심볼 분석에 제한이 있다. 바이너리 업로드·Apple 처리·심사 접수는 완료했다.

## 승인 후 재빌드 — 업로드 및 Apple 처리 완료

- 기존 심사 보류는 사용자의 최신 출시 진행 지시로 해제했다. 수정 전 아카이브는 제출하지 않는다.
- PC 1.3.6 universal 빌드·Apple Distribution 서명·아카이브 deep/strict 검증 통과. 실제 app.asar 검사에서 autoBreak/휴식 저장 키 포함, 첫 안내/하루 마무리 문자열·route·픽셀 자산 미포함을 확인했다. `apps/desktop/build-output/verify-1.3.6-features.json`.
- 새 PC 아카이브: `apps/desktop/build-output/NeowFocus-1.3.6-1.3.6.xcarchive`. Xcode Organizer에서 App Store Connect 방식으로 **20:52:55 KST 업로드 성공**. ContentDelivery 로그 `UPLOAD SUCCEEDED with no errors`, GUI `Upload completed with warnings` 확인. Electron·helper·native addon dSYM 경고는 남는다. `evidence/macos-1.3.6-upload-completed.png`.
- Mac 공개 버전에 정확한 1.3.6(1.3.6)을 연결한 뒤 **21:02 KST 공개 심사 제출 완료 / 심사 대기 중**을 확인했다. 제출 ID `763cc768-0ca8-4f51-8a04-cc1eb29c4753`. 승인 후 자동 출시 설정이다. `evidence/macos-1.3.6-waiting-for-review.png`.
- iOS 앱 설정/실제 앱 Info.plist와 위젯 빌드 설정을 9로 올렸고 **ARCHIVE SUCCEEDED**, 앱/위젯 0.1.0(9), deep/strict 서명 검증 통과. 실제 Hermes 바이너리에서 빌드 8의 첫 안내 문자열이 검출되고 새 빌드 9에는 없음을 비교 확인했다. 자동 휴식 저장 키와 승인 픽셀 이미지 SHA-256 일치도 확인했다. `apps/mobile/build-output/archive-0.1.0-9.log`, `native-features-0.1.0-9.json`. Xcode Organizer에서 **20:56 KST 업로드 완료**, `Uploaded to Apple` / build 9를 확인했다. React·ReactNativeDependencies·Hermes dSYM 경고가 남는다. `evidence/ios-0.1.0-9-upload-completed.png`.
- 이전 Mac 아카이브 복사 중 framework 심볼릭 링크가 풀리는 문제는 macOS `ditto`로 새 복사본을 만들고 서명 검증 통과로 해결했다. 서명 검증에 실패한 복사본은 업로드하지 않았다.

## 사용자 수정 이력 — 당시 공개 심사 보류

사용자가 첫 안내 제거에 이어 PC 디자인 복원을 요청하고, ‘오늘은 여기까지’는 PC에 없던 기능이라고 명시했다. 첫 안내는 두 플랫폼에서 제거했다. PC는 기존 입력·집중·완료 디자인으로 복원하고 하루 마무리/요약/픽셀 고양이의 UI·경로·컴포넌트·자산을 제거했다. 모바일 하루 마무리는 유지한다. 요청된 자동 휴식과 연결 기능은 유지한다. [현재 PC 범위·검증](../../implementation/pc-design-rollback.md). 이 수정이 반영되기 전 아카이브를 공개 심사에 사용하지 않는다.

- Mac 공개 초안에서도 픽셀 고양이·하루 마무리·집중 중 시간 숨김 설명을 제거하여 저장했다. `macos-store-metadata-after-rollback.json`, `evidence/macos-draft-after-rollback.png`.

- iOS 0.1.0(8)은 Xcode Organizer에서 20:24 KST `Uploaded to Apple` / build 8 업로드 완료를 확인했다. React, ReactNativeDependencies, Hermes dSYM 경고가 남는다. 아직 공개 심사 제출이나 출시가 아니다.
- Mac 1.3.5 직접 업로드는 전송 중 사용자 피드백을 반영하여 취소했다. Organizer에서 업로드 완료 표시는 없다. 서버 수신 여부는 별도 확인이 필요하다.
- 기존 업로드 빌드 선택/심사 제출은 보류했다. 수정본으로 다시 아카이브해야 한다.

## App Store Connect에서 완료한 항목

- 기존 macOS 1.3.0의 공개 등록 정보를 확인했다.
- 새 macOS 1.3.5 버전을 **제출 준비 중**으로 생성했다.
- 같은 앱에 iOS 플랫폼을 추가하고 첫 iOS 공개 버전을 **0.1.0 / 제출 준비 중**으로 저장했다. 준비된 바이너리의 버전과 일치시켰다.
- 두 플랫폼의 한국어 프로모션/설명/키워드 및 플랫폼별 영어 심사 안내를 저장했다. 자동 휴식 기본 꺼짐, 기존 완료 발자국, 하루 마무리 픽셀 고양이, 선택형 iCloud를 설명한다. iOS에 제공되지 않는 Chrome/앱 차단을 제공 기능으로 표시하지 않았다.
- 기존 지원 URL/저작권/심사 연락처 및 승인 후 자동 출시 설정을 유지했다. 가격/국가/거래자 자격/법적 계약은 바꾸지 않았다.

이 절은 초안 준비 이력이다. 현재 심사 제출 상태는 상단 표를 따른다. 공개 출시는 Apple 승인 후 자동 진행된다. 저장한 iOS 문구는 `ios-store-metadata.json`에 보관했다.

## 계약 및 업로드 진행

- 2026-10-16 19:06 KST 두 빌드 업로드는 `Failed to Use Accounts` / App Store Connect access required로 실패했다.
- 웹 로그인 후 App Store Connect와 Apple Developer 계정에서 갱신된 **Apple Developer Program License Agreement 검토/동의 필요** 안내를 확인했다. Developer 계정 안내에는 2026-10-29까지 갱신 계약 동의가 필요하다고 표시한다. 계약 미동의가 모든 CLI 인증 오류의 단일 원인인지는 아직 검증되지 않았다.
- 사용자의 최초 완료 답변 후에도 갱신 경고와 동의 버튼이 남아 있었다. 현재 계약의 동의 제출을 사용자에게 명시적으로 승인받아 2026-10-16 20:23 KST 동의 버튼을 눌렀고, 계정 페이지의 갱신 경고가 사라졌다. `evidence/apple-agreement-accepted.png`.
- App Store Connect에는 EU 거래자 자격 여부 제공 안내도 있다. 개인 사업 여부나 거래자 자격은 추측하여 입력하지 않는다.

계약 검토 화면: `evidence/apple-agreement-review.png`.

## 빌드 및 재개

- iOS: `apps/mobile/build-output/NeowFocus-0.1.0-8.xcarchive`, 실제 앱/위젯 빌드 번호와 Hermes 기능 포함·서명 검증 완료.
- macOS: `apps/desktop/build-output/NeowFocus-1.3.5-1.3.5.xcarchive`, universal 패키징·Apple Distribution 서명 검증 완료.
- 계약 제출 전 20:20 KST 두 CLI 업로드도 같은 계정 접근 오류로 실패했다. `upload-*-contract-20261016.log`. 20:23 KST 계약 제출 후 Mac CLI도 같은 오류로 실패했다 (`upload-1.3.5-agreed-20261016.log`). CLI 오류와 웹 계정 상태를 구분한다.
- Xcode Organizer에서 정확한 iOS 0.1.0(8) 아카이브를 열어 App Store Connect 배포를 실행했으며 실제 파일 전송 단계로 진행했다. 최종 결과는 별도 확인한다.
- 공개 스토어용 별도 `StoreScreenshotsDerivedData`의 Release 시뮬레이터 빌드가 성공했다. 표준 Xcode Simulator 서명으로 App Group 접근 오류를 해소했고 실제 앱 화면을 확인했다. Production 아카이브는 바꾸지 않았다.
- iPhone 18 Pro Max / iOS 27.0 시뮬레이터에서 집중 실행, 수동 완료, 기존 일반 발자국, 같은 작업·25분 반복 준비, 자동 휴식 기본 false → 켜기 → 완료 직후 10:00, 오늘 마무리의 대각선 픽셀 고양이 및 방향이 맞는 픽셀 발도장을 확인했다. 재실행 후 완료 기록도 유지됐다. 실기기 소리·진동 및 실제 기기간 iCloud 검증을 의미하지 않는다.
- Device Hub에서 원본 1320×2868 PNG 5장을 캡처하여 `screenshots/ios/`에 보존하고 App Store Connect 한국어 대형 Dynamic Island 슬롯에 업로드했다. 스토어에서 5개 자산과 중형 슬롯의 기존 자산 사용 상태를 확인했다.
- 테스트 시뮬레이터에서 알림 권한 거부 시 알림 예약 실패 안내가 표시됨을 확인했다. 이후 소리·진동을 해당 시뮬레이터에서만 끄고 다시 실행하여 오류 안내 없는 스크린샷을 캡처했다. 앱 기본값이나 사용자 실기기 설정을 바꾸지 않았다.

계약 갱신, 새 빌드 업로드 및 Apple 처리, 빌드·스크린샷 연결과 공개 심사 제출을 완료했다. 남은 외부 단계는 Apple 심사 및 승인 후 자동 출시다. 심사 승인·공개 스토어 노출·사용자 설치는 아직 확인되지 않았다.
