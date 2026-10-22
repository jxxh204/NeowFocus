# 2026-10-22 — iOS 0.1.1(13) TestFlight 배포 확인 완료

타이머 스타일 3종과 승인한 설정·두 버튼 바텀시트가 포함된 새 iOS 배포 아카이브를 만들었다. 앱/위젯 0.1.1(13), 실제 번들·픽셀 자산·Screen Time API 제거·서명 검사를 통과했고 **14:37 KST TestFlight 업로드 성공 / EXPORT SUCCEEDED**를 확인했다. Apple 처리 완료 후 기존 내부 그룹 **더기와 쟈니들(2명)** 연결과 한국어 테스트 안내 저장을 확인했다. 실물 iPhone 설치/동작 확인은 별도다. [최신 기록](../../../docs/release/2026-10-22/ios-0.1.1-13/README.md).

현재 App Store Connect에서 기존 iOS 0.1.0(12)은 **배포 준비됨**으로 확인했다. 아래 심사 대기 문구는 각 날짜 당시의 이력이다.

---

# 공개 심사 제출 완료 — 2026-10-18

macOS **1.3.7(1.3.7)**와 iOS **0.1.0(12)** 모두 01:07 KST 공개 심사 접수 완료 / 심사 대기 중. 승인 후 자동 출시 설정이다. PC 완료 버튼 문구 변경과 iOS Screen Time API 제거·정책/문의 보완을 포함하며, 공개 개인정보처리방침도 승인 후 갱신했다. [최신 상태와 증거](../../../docs/release/2026-10-18/README.md)가 아래 날짜별 이력보다 우선한다. 실제 공개 출시·새 버전 실기기 확인은 아직 완료되지 않았다.

# 2026-10-17 — iOS 심사 2.5.1 수정 중

iOS 빌드 9는 불필요한 Screen Time API 포함으로 거절됐다. 관련 코드·링크·권한을 제거하고 개인정보 안내/문의 경로를 보완한 최종 빌드 12의 아카이브·실제 바이너리·서명 검사를 통과했다. Xcode 업로드 인증 실패 및 웹 로그인 만료로 업로드·재제출은 대기 중이다. 재심사 제출은 아직 완료되지 않았다. [현재 수정·검증·출시 상태](../../../docs/release/2026-10-17/README.md)가 아래 이력보다 우선한다.

# 2026-10-16 — 0.1.0(9), 공개 심사 제출 완료

첫 안내를 제거한 승인 수정본을 빌드 9로 재아카이브했다. 앱/위젯 빌드 번호, 서명 deep/strict 검증 및 Hermes의 첫 안내 제거·자동 휴식·승인 픽셀 이미지 포함을 확인했다. Xcode Organizer에서 20:56 KST 업로드 완료, Apple 처리 후 정확한 빌드 9를 공개 버전에 연결해 **21:03 KST 심사 제출 완료 / 심사 대기 중**을 확인했다. 승인 후 자동 출시 설정이다. 아직 공개 스토어 노출이나 빌드 9의 실기기 동작 검증은 아니다. 프레임워크 dSYM 경고는 남는다.

- 아카이브: `apps/mobile/build-output/NeowFocus-0.1.0-9.xcarchive`
- 제출 ID: `0f317a49-c99b-4615-83d2-099e97ee8176`
- [전체 출시 기록과 증거](../../../docs/release/2026-10-16/README.md). 아래는 과거 이력이다.

# 2026-10-16 — 공개 출시 준비, 사용자 피드백 반영 중

- App Store Connect에 첫 iOS 공개 버전 0.1.0 초안과 한국어 소개·심사 안내·실제 시뮬레이터 스크린샷 5장을 저장했다.
- 사용자 명시적 승인 후 Apple Developer 갱신 계약을 수락 제출했고 경고가 사라졌다.
- CLI 계정 접근 실패와 별개로 Xcode Organizer의 App Store Connect 배포로 20:24 KST 0.1.0(8) `Uploaded to Apple` / build 8을 확인했다. React, ReactNativeDependencies, Hermes dSYM 경고는 남는다.
- 이후 사용자가 첫 안내 화면을 제거하고 추가된 기능 범위를 재검토하도록 요청했다. PC·모바일 소스에서 첫 안내를 제거했다. **빌드 8에는 수정이 없으므로 공개 심사에 사용하지 않는다.**
- 공개 심사 제출·승인·출시는 하지 않았다. 상세: [공개 출시 기록](../../../docs/release/2026-10-16/README.md).

---

# 2026-10-15 — 0.1.0 (8), 실제 앱 빌드 완료·업로드 인증 대기

자동 10분 휴식을 실제 iOS 앱에 포함했다. 설정 기본값 false, 집중 완료 후 10분 휴식, 중간 종료·재실행 복원을 포함한다. 기존 일반 완료 발자국과 하루 마무리 픽셀 고양이를 유지한다.

- iOS Release `ARCHIVE SUCCEEDED`, 종료 코드 0 확인.
- 앱과 위젯 모두 버전 0.1.0 / 빌드 8 확인.
- 아카이브의 실제 Hermes `main.jsbundle`에서 `autoBreak`와 휴식 저장 키 포함 확인. 승인 픽셀 스프라이트도 원본 SHA-256 일치 확인.
- 시스템 키체인으로 `codesign --verify --deep --strict` 통과.
- 아카이브: `apps/mobile/build-output/NeowFocus-0.1.0-8.xcarchive`.
- 로그: 같은 폴더 `archive-0.1.0-8.log`, `verify-0.1.0-8.log`, `native-features-0.1.0-8.json`.
- 2026-10-15 15:48 KST TestFlight 업로드 시도는 `Failed to Use Accounts` / `App Store Connect access for L67FAG9382 is required`로 `EXPORT FAILED` (exit 70). **업로드 성공·테스터 업데이트 표시·실기기 실행은 아직 미확인**.
- 이 Mac Xcode → Settings → Accounts에서 기존 Apple 계정 인증을 복구한 뒤 모바일 폴더에서 `bash scripts/upload-testflight.sh build-output/NeowFocus-0.1.0-8.xcarchive build-output/TestFlight-0.1.0-8`로 재개한다. 재빌드·기존 앱 삭제·기록 초기화는 필요 없다.
- PC 1.3.5도 준비됐으나 같은 계정 인증 오류로 업로드 대기다. [PC 기록](../../../docs/implementation/desktop-release.md).

아래 0.1.0(7) 이하 업로드 성공은 과거 이력이며 새 빌드 8의 성공을 의미하지 않는다.

---

# 2026-10-14 — 0.1.0 (7), TestFlight 업로드 성공

사용자 배포 요청에 따라 최신 모바일 집중·성취 흐름을 새 아카이브로 만들어 2026-10-14 22:53:38 KST App Store Connect에 업로드했다. 일반 집중 완료는 기존 발자국 아이콘과 정지 화면, ‘오늘은 여기까지’에서만 8방향 픽셀 고양이와 픽셀 도장. 직전 등장 방향을 제외하고 도장 방향·접촉 위치를 맞춘다. 짧은 집중 기록, 같은 작업 재준비, 하루 요약과 휴식, 시간 숫자 없는 게이지, 위젯 개선 포함.

- 모바일 타입 검사, iOS Hermes 번들 생성, 시뮬레이터 빌드와 일반 완료 실행 확인.
- Release `ARCHIVE SUCCEEDED`, 앱 및 위젯의 버전 0.1.0 / 빌드 7, 포함된 픽셀 스프라이트와 JS 번들 확인. 시스템 키체인으로 `codesign --verify --deep --strict` 통과. 업로드 `Upload succeeded`, `Uploaded NeowFocus`, `EXPORT SUCCEEDED`, 종료 코드 0 확인.
- 아카이브: `build-output/NeowFocus-0.1.0-7.xcarchive`
- 로그: `build-output/archive-0.1.0-7.log`, `build-output/upload-0.1.0-7.log`
- Apple 응답: `Uploaded package is processing.` 처리 완료·테스트 그룹 접근·테스터 업데이트 표시·실기기 동작은 미확인. App Store Connect 브라우저 세션은 로그인되지 않아 처리 완료 화면을 확인하지 못했다. 공개 App Store 심사는 제출하지 않았다.
- React, ReactNativeDependencies, hermesvm framework dSYM 누락 경고가 있다. 업로드는 성공했지만 해당 프레임워크 크래시 심볼 분석에는 제한이 남는다.
- 이번 고양이·하루 마무리 화면은 모바일 전용. PC 화면은 변경하지 않았고 PC 재업로드도 하지 않았다. PC의 기존 짧은 집중 보존 동작은 유지한다.

---

# TestFlight 업로드 상태 — 2026-10-13

## 최신 결과: 새 구현 업로드 성공 — 23:08 KST

2026-10-13 23:08:50 KST, A UX·동기화·위젯 코드와 여백 없는 새 iOS 아이콘이 포함된 0.1.0(2) 아카이브를 업로드했다. `Upload succeeded`, `Uploaded NeowFocus`, `EXPORT SUCCEEDED`, 종료 코드 0 확인. Apple 응답은 `Uploaded package is processing.`이며 처리 완료·테스터 설치 가능 여부·실기기 검증은 아직 확인하지 않았다. 공개 App Store 심사는 제출하지 않았다.

- 아카이브: `apps/mobile/build-output/NeowFocus-0.1.0-2.xcarchive`
- 빌드 로그: `apps/mobile/build-output/archive-0.1.0-2.log`
- 업로드 로그: `apps/mobile/build-output/upload-0.1.0-2.log`
- 앱 서명에 CloudKit container와 App Group entitlement 포함 확인.
- React·ReactNativeDependencies·hermesvm dSYM 누락 경고가 있다. 업로드는 성공했으나 해당 프레임워크의 크래시 심볼 분석은 제한될 수 있다.
- 잠긴 폰의 원격 변경 수신/APNs는 미구현, Family Controls 비활성, Production CloudKit schema 및 실제 기기간 통신 미검증. [현재 구현 상태](../../../docs/implementation/README.md)를 확인한다.
- 업로드 스크립트는 이제 아카이브 경로를 필수 인자로 받아 예전 MVP를 실수로 재업로드하지 않도록 했다.

## 이전 결과: 기존 MVP 업로드 성공


2026-10-13 20:17 KST, 기존 아카이브로 업로드를 재시도하여 `Upload succeeded`, `Uploaded NeowFocus`, `EXPORT SUCCEEDED` 및 종료 코드 0을 확인했다. 이전 Xcode 계정 인증 차단은 이번 실행에서 해소됐다.

Apple 응답은 `Uploaded package is processing.`이다. 처리 완료, 테스트 그룹 배정, 사용자 설치 가능 여부는 아직 확인하지 않았다. 공개 App Store 심사는 제출하지 않았다.

React.framework, ReactNativeDependencies.framework, hermesvm.framework의 dSYM 미포함 경고가 있다. 업로드는 성공했지만 해당 프레임워크의 크래시 분석용 심볼이 누락될 수 있다.

로그: `apps/mobile/build-output/logs/upload-20261013.log`

이하 10월 2일 이력은 당시 상태로 보존한다. 최신 상태는 위 결과를 따른다.

---

## 완료

- 기존 모바일 MVP: Expo SDK 57, 버전 0.1.0
- 팀 L67FAG9382, bundle ID com.neowfocus.pomodorotimer
- 모바일 TypeScript 검사 통과
- 공통 로직 Vitest 26개 통과
- CocoaPods 설치 및 pod install 완료
- iOS 네이티브 프로젝트 생성
- 로컬 알림 전용 entitlement 플러그인 추가; introspect로 aps-environment 없음 확인
- Release 아카이브: ARCHIVE SUCCEEDED
- 아카이브: apps/mobile/build-output/NeowFocus.xcarchive

## 차단

업로드 스크립트를 실제로 실행했지만 export 단계에서 아래 오류로 실패했다.

```
error: exportArchive Failed to Use Accounts
App Store Connect access for “L67FAG9382” is required.
Ensure that your Apple Account usernames and passwords are correct in Accounts settings.
EXPORT FAILED
```

Apple 개발자 가입은 사용자가 이미 확인했다. 가입을 다시 묻지 않는다. 필요한 것은 이 Mac Xcode의 Accounts 인증/해당 팀 App Store Connect 접근 복구다. 인증서가 있는 것만으로 계정 인증이 대체되지는 않는다.

## 재개

Xcode Settings → Accounts에서 기존 Apple 계정의 로그인과 팀 접근을 확인한 뒤 모바일 폴더에서 `./scripts/upload-testflight.sh`를 다시 실행한다. 소스나 설정이 바뀌지 않았다면 완료한 아카이브를 재사용할 수 있다.

업로드 후 처리 완료, TestFlight 그룹 배정 및 사용자 설치 가능 상태는 별도로 확인한다. 현재는 업로드 성공이나 TestFlight 설치 가능 상태가 아니다. 네이티브 실기기 실행도 미검증이다.

로그: apps/mobile/build-output/logs/{pods,archive,upload}.log

실시간 기기간 동기화와 네이티브 위젯은 이 MVP에 구현되어 있지 않다. 공개 App Store 심사 제출은 하지 않았다.

## 2026-10-14 — 0.1.0 (3)

잠금화면 텍스트 대비/작업명 크기와 시간 기반 게이지 수정. archive-0.1.0-3.log: ARCHIVE SUCCEEDED. upload-0.1.0-3.log: Uploaded NeowFocus / EXPORT SUCCEEDED. Hermes framework dSYM 누락 경고는 남아 있다. Apple 처리·테스터 표시 및 수정본 iPhone 실기기 검증은 별도다.

## 2026-10-14 — 0.1.0 (4)

CloudKit 변경 알림/기존 Live Activity의 백그라운드 갱신, 완료 소리·진동, 발도장 애니메이션 포함. 별도 서버 없음. 타입 검사/ARCHIVE SUCCEEDED/Uploaded NeowFocus/EXPORT SUCCEEDED 확인. ReactNativeDependencies 및 hermesvm dSYM 경고 잔존. 새 잠금화면 Activity 원격 시작은 미지원, 기기 간 실제 push 전달/소리·진동은 설치 후 검증 필요. 타이머 비율 변경은 시안만 준비했고 앱 미적용.

## 2026-10-14 — 0.1.0 (5)

모바일 타이머 링 두께 22, 바늘 길이 반지름의 55% 적용. 동작 버튼 위치 유지. 모바일 타입 검사 통과. archive-0.1.0-5.log: ARCHIVE SUCCEEDED. upload-0.1.0-5.log: Uploaded NeowFocus / EXPORT SUCCEEDED, 종료 코드 0. 아카이브 CFBundleVersion 5 확인. dSYM 업로드 경고가 남아 있으나 앱 업로드 성공. Apple 처리 완료·테스터 표시 및 실기기 확인은 미검증.

## 2026-10-14 — 0.1.0 (6), 업로드 인증 대기

집중/일시정지 화면의 하단 버튼을 좌우 한 줄로 배치. 완료 소리·진동 기본값 true, 기존 명시적 false 유지. 토글 iOS 꺼짐 배경 및 너비 축소 방지 적용. 타입 검사 및 ARCHIVE SUCCEEDED 확인. 아카이브 CFBundleVersion 6. 업로드는 Failed to Use Accounts / App Store Connect access for L67FAG9382 is required로 실패(exit 70). Xcode Apple Accounts에서 Sign In 창을 열었으며 사용자 재로그인 대기. 재로그인 후 scripts/upload-testflight.sh build-output/NeowFocus-0.1.0-6.xcarchive build-output/TestFlight-0.1.0-6 재실행. 재빌드 불필요.
