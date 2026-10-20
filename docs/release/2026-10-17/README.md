# 공개 심사 제출 완료 — 2026-10-18

macOS **1.3.7(1.3.7)**와 iOS **0.1.0(12)** 모두 01:07 KST 공개 심사 접수 완료 / 심사 대기 중. 승인 후 자동 출시 설정이다. PC 완료 버튼 문구 변경과 iOS Screen Time API 제거·정책/문의 보완을 포함하며, 공개 개인정보처리방침도 승인 후 갱신했다. [최신 상태와 증거](../2026-10-18/README.md)가 아래 날짜별 이력보다 우선한다. 실제 공개 출시·새 버전 실기기 확인은 아직 완료되지 않았다.

# iOS 심사 대응 및 추가 점검 — 2026-10-17

## 최종 제출 대상: 0.1.0(12)

**ARCHIVE SUCCEEDED / 바이너리·서명 검사 통과**. 앱과 위젯 모두 0.1.0(12)이며 Screen Time 관련 코드·framework 링크·권한·monitor 없음. 정책/문의 문구 실제 번들 포함, 첫 안내 미포함, 자동 휴식·승인 픽셀 이미지 유지. 삭제된 차단 코드의 UserDefaults 사유 선언도 실제 manifest 13개에서 제거됨을 확인했다. SDK에 필요한 CA92.1 등은 유지했다.

- 최종 아카이브: `apps/mobile/build-output/NeowFocus-0.1.0-12.xcarchive`
- 검사: `screen-time-audit-build12.json`, `native-features-build12.json`, `privacy-manifests-build12.json`.
- 빌드 10/11은 중간 검증 이력이며 제출 대상이 아니다.
- 업로드·재심사 제출·공개 정책 갱신은 아직 완료하지 않았다. Apple 인증 복구 및 공개 정책 게시 승인이 필요하다.

## 중간 빌드 11 — 개인정보 UI 보완 이력

추가 점검에서 앱 내 개인정보 안내/문의 경로 누락과 공개 정책의 iCloud 설명 불일치를 확인했다. 설정 하단에 오프라인 개인정보처리방침과 문의를 추가한 **빌드 11 ARCHIVE SUCCEEDED** 및 Screen Time 제거/서명/버전·앱 번들 내 정책 포함 검증 통과. `screen-time-audit-build11.json`, `native-features-build11.json`. **빌드 10은 추가 개인정보 보완 전이므로 최종 제출에 쓰지 않는다.**

375px/430px 웹 미리보기의 정책 열기·돌아가기와 집중 시작/정지/수동 완료/기록 저장·삭제 확인. 실제 iPhone 검증은 아니다. [전체 추가 심사 점검](app-review-audit.md).

공개 정책 수정안은 [privacy-policy-update-proposal.md](privacy-policy-update-proposal.md)에 보관했고 게시 승인은 대기 중이다. Apple 인증 복구도 필요하다. 빌드 11 업로드·재심사 제출·공개 출시는 아직 완료하지 않았다. 아래 빌드 10 기록은 첫 수정 이력이다.

## 거절 사유와 확인된 원인

사용자가 전달한 Apple 심사 메시지는 Guideline 2.5.1이다. 실제 제공 기능에 Screen Time API가 필요하지 않으므로 관련 API를 제거하도록 안내한다. 첨부 메시지에서 확인한 사유이며, App Store Connect 웹의 전체 메시지는 로그인 만료로 아직 읽지 못했다. macOS의 최신 심사 결과도 이번에는 확인하지 않았다.

기존 iOS 0.1.0(9)은 차단 runtime flag와 entitlement가 꺼져 있었지만 `FocusBlocking.swift`·앱 선택 picker·native bridge가 컴파일되고 podspec의 FamilyControls/ManagedSettings/DeviceActivity 링크가 앱에 남았다. 공유 Swift 소스 복사로 위젯도 동일한 세 framework에 링크했다. 기존 아카이브의 `otool -L`와 바이너리 검사로 확인했다. **권한 비활성화만으로 API 제거를 검증한 것으로 취급한 것이 누락이었다.**

## 수정 범위

- iOS의 차단 Swift 구현·picker·monitor 저작 소스와 Expo bridge/JS 호출·타입을 제거했다.
- podspec의 세 framework를 제거하고 CocoaPods 지원 설정을 재생성했다.
- 위젯의 공유 blocking 소스와 Xcode 빌드 참조를 제거했다. 앱과 위젯의 legacy blocking Info.plist key도 제거했다.
- plugin이 차단 entitlement·monitor 타깃·관련 소스를 생성하지 않도록 수정했다. 기존 entitlement는 정리한다.
- 사용할 수 없었던 앱 차단 설정 설명/컨트롤을 제거했다. 기존 타이머·자동 10분 휴식·모바일 하루 마무리·원래 일반 발자국·위젯·Live Activity·선택형 iCloud는 유지한다. PC 구현은 바꾸지 않는다.
- iOS 앱과 위젯의 새 빌드 번호는 **0.1.0(10)**이다.

## 검증과 배포 상태

- 모바일 TypeScript 검사 통과, plugin JavaScript/podspec Ruby 문법 검사 통과, `git diff --check` 통과.
- `scripts/verify-screen-time-free.py`는 앱과 모든 확장의 바이너리 문자열, 모든 동봉 Mach-O의 직접 framework 링크, 실제 서명 entitlement, extension point, legacy flag와 deep/strict 서명을 검사한다. 기존 빌드 9에서 관련 API와 링크를 검출해 실패함을 확인했다.
- 기존 검사 결과: `apps/mobile/build-output/screen-time-audit-build9.json`.
- `pod install --no-repo-update` 완료. 생성된 pod 링크 설정과 Sources 목록에서 세 framework 및 차단 Swift 파일 참조가 사라졌다.
- **ARCHIVE SUCCEEDED**: `apps/mobile/build-output/NeowFocus-0.1.0-10.xcarchive`, 로그 `archive-0.1.0-10.log`.
- 새 아카이브 앱/위젯 모두 0.1.0(10), 서명 deep/strict 검사 통과. 동봉 Mach-O 10개의 링크, 앱/위젯의 framework 문자열과 서명 권한·legacy flag·확장 종류 검사 **passed: true / issues: []**. `screen-time-audit-build10.json`.
- 승인 픽셀 자산 SHA-256이 빌드 9와 동일하고 자동 휴식이 포함되며 첫 안내 문자열이 없음을 확인했다. `native-features-build10.json`. 이 검사는 실기기 실행 검증을 뜻하지 않는다.
- Xcode Organizer에서 정확한 0.1.0(10)을 열고 App Store Connect 배포를 실행했으나 **Unable to authenticate with App Store Connect / App Store Connect access required**로 파일 업로드 전에 중단됐다. 기존 계정의 Sign In 창을 열었다. 새 빌드의 업로드·Apple 처리·재심사 접수는 완료되지 않았다.
- App Store Connect 웹 로그인도 만료됐다. 기존 계정의 Xcode 및 웹 로그인 후 보관 아카이브로 업로드와 공개 재심사를 이어간다. 재빌드는 필요 없다. 기존 빌드 9로 재심사를 요청하지 않는다.

## 재심사 메모 초안

Build 12 removes the unused Screen Time integration entirely. The app and WidgetKit extension no longer contain or link FamilyControls, ManagedSettings, or DeviceActivity, and do not request Screen Time authorization. The unavailable app-blocking controls, native bridge methods, and monitor source have been removed. The focus timer, local notifications, widgets, Live Activities, and optional iCloud sync remain available. The final signed archive has been checked for framework links and entitlements. Please review build 12.

이 메모는 검증 완료 후 제출할 초안이며 아직 Apple에 메시지로 보내지 않았다.

근거: [Apple App Review Guidelines 2.5.1](https://developer.apple.com/app-store/review/guidelines/#software-requirements).
