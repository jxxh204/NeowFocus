# iOS 추가 App Review 점검 — 2026-10-17

검토 대상: 서명된 0.1.0(10/11/12) 아카이브, 최종 빌드 12 소스, 기존 스토어 저장 문구·스크린샷 기록, 로그인 없이 실제 열린 공개 정책 및 지원 URL. App Store Connect와 Xcode 인증은 만료되어 현재 서버 등록값·전체 심사 메시지·최종 처리 결과는 읽지 못했다. 승인을 보장하는 결과가 아니다.

## 확인한 문제

| 우선순위 | 확인한 사실 | 대응과 현재 상태 |
| --- | --- | --- |
| P1 | 앱 설정 안에서 개인정보처리방침을 열 수 없었다. 설정에 문의 경로도 없었다. 5.1.1(i), 1.5와 연결된다. | 설정 하단에 개인정보처리방침과 문의하기 추가. 정책은 앱에 포함해 인터넷 없이 읽고 설정으로 돌아갈 수 있다. 공개 README에서 확인한 지원 이메일을 사용한다. 빌드 11 아카이브·실제 번들의 정책 포함 검증 통과. |
| P1 | 기존 공개 Notion 정책은 2025년 10월 내용으로 모든 자료가 Mac에만 남고 네트워크 통신이 없다고 설명한다. 실제 선택형 iCloud 기능과 모순된다. | 저장·동기화 데이터, 위젯/잠금화면, Chrome 연결, 추적 여부와 보관 한계를 설명하는 `privacy-policy-update-proposal.md` 준비. 공개 정책 게시 변경은 사용자 승인 대기. 기존 공개 정책을 고친 것으로 보고하지 않는다. |
| 보완 | `deleteRecord`는 실행 취소/동기화를 위해 `recordChanges[].record`에 원본 내용을 유지한다. 앱의 삭제는 데이터의 완전 파기와 다르다. iCloud 전체 데이터 삭제·내보내기 UI는 없다. | 앱 내 정책/공개 수정안에 삭제 후 이력 잔존 및 동기화 해제와 삭제의 차이를 명시했다. 완전 파기 기능을 제공한다고 쓰지 않는다. CloudKit 전체 삭제/내보내기는 제품 결정과 동기화 충돌 설계가 필요한 후속 보완 항목이다. 이것이 이번 Apple 메시지에 포함된 거절 사유라고 단정하지 않는다. |
| 보완 | 지원 URL은 공개로 정상 열리고 문의 이메일이 있으나, 공개 README는 과거 macOS 버전/로컬 전용 설명이다. | 404나 로그인 필수 URL은 아니다. 다음 공개 문서 갱신 때 모바일/선택 동기화 설명을 맞춰야 한다. 이번 점검으로 원격 GitHub 내용을 바꾸지는 않았다. |

## 추가 점검에서 확인한 항목

- Screen Time: 빌드 10의 앱/위젯 바이너리, 동봉 Mach-O 10개, entitlements·extension point에 FamilyControls/ManagedSettings/DeviceActivity 및 monitor 없음. `screen-time-audit-build10.json`. 빌드 11도 같은 검사 통과. `screen-time-audit-build11.json`.
- 백그라운드: 실제 앱의 `UIBackgroundModes`는 `remote-notification` 하나다. 선택 iCloud의 CKQuerySubscription 및 `FocusCloudSubscriber` 수신 구현이 있으며, 타이머만으로 지속 백그라운드 실행을 요구하지 않는다. 불필요한 audio/location/VoIP mode가 없다.
- 민감 권한: 사용자 작성 앱 Info.plist에 카메라·마이크·연락처·위치·HealthKit·추적 권한 요청 문구 없음. 앱 소스에 해당 권한 요청이나 광고 SDK/추적 API 사용은 발견하지 않았다. 모든 서드파티 SDK 내부 동작을 보증하는 뜻은 아니다.
- Privacy Manifest: 실제 아카이브의 앱·위젯 및 SDK bundle 13개에 manifest가 포함된다. tracking=false, tracking domains 없음. 추가 대조에서 자체 모듈의 UserDefaults 1C8F.1 선언은 삭제한 차단 코드의 잔여임을 확인했다. 자체 소스에서 실제 사용이 없어 원본·생성 manifest에서 제거했다. React/Expo SDK가 쓰는 CA92.1 등은 유지했다. 빌드 12의 실제 manifest 13개에서 해당 잔여 선언이 없음을 확인했다. 최상위 병합 manifest에는 UserDefaults, FileTimestamp, SystemBootTime 이유가 있다.
- iCloud: 기본 꺼짐, 개인 CloudKit DB 사용, 명시적으로 켠 뒤에만 sync/subscribe. 로컬 타이머는 로그인 없이 사용한다. 저장/읽기/구독에 오류 처리와 동기화 상태 표시가 있다. CloudKit Production 및 실제 서로 다른 기기 간 이번 빌드 동작은 재검증하지 못했다.
- 계정·결제: 별도 앱 계정 생성/외부 로그인/IAP/유료 잠금 기능이 없어 앱 계정 삭제·결제 복구·Sign in with Apple 추가 대상 기능은 발견하지 않았다.
- 스토어 설명: 저장해둔 iOS 설명은 집중/일반 발자국/모바일 하루 마무리/자동 휴식 기본 off/위젯/선택형 iCloud를 안내한다. Chrome/Screen Time 차단을 iOS 제공 기능으로 주장하지 않는다. 원격 Mac 시작으로 잠긴 iPhone에 새 Live Activity가 항상 생긴다고 보장하지 않는다.
- 지원 URL: 로그인하지 않은 브라우저에서 실제 공개 GitHub 저장소와 지원 이메일·개인정보 정책 링크를 확인했다.
- 로컬 저장 오류는 빈 상태로 조용히 덮어쓰지 않고 표시한다. 알림 권한 처리와 네트워크 실패는 타이머 시작을 선행 조건으로 막지 않는다. 알림 거부 때 오류 문구가 보일 수 있으므로 기기에서 다시 확인할 항목이다.

## 실제 확인과 남은 범위

375px/430px 웹 미리보기에서 설정 → 앱에 포함된 개인정보 안내 → 설정 복귀 및 설정 기본 autoBreak=false를 확인했다. 문서 전체 폭은 375px로 가로 넘침이 없다. 같은 컴포넌트의 시각/동작 확인이며 iPhone 실기기 확인은 아니다. 메일 앱을 띄우거나 이메일을 보내지는 않았다. 문의 버튼에는 메일 앱 실행 실패 시 주소를 보여주는 처리가 있다.

새 빌드는 제출 전에 Screen Time 제거·서명/버전·정책 포함을 실제 아카이브에서 재확인해야 한다. 로그인 후 App Store Connect의 Privacy URL/개인정보 라벨/등급·현재 스크린샷·빌드 선택을 확인하고, 실기기에서 알림 거부·무음/진동·백그라운드 복귀·iCloud off 및 on·위젯 조작을 확인해야 한다. 확인하지 않은 항목을 통과라고 표시하지 않는다.

## 근거

- [Apple App Review Guidelines 5.1.1 / 1.5 / 2.1 / 2.5](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Required Reason API 문서](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype)
- [CloudKit 데이터 관리 안내](https://developer.apple.com/icloud/allowing-users-to-manage-data/)
- 기존 정책: https://jamkim.notion.site/2855072e39f5807596d0c4a8de4ebf88
- 지원 URL: https://github.com/jxxh204/NeowFocus

빌드 11 최종 아카이브 검증 완료: 앱/위젯 0.1.0(11), 실제 번들의 정책/문의 문자열 포함, 자동 휴식 포함, 첫 안내 미포함, 승인 픽셀 자산 SHA-256 동일, Screen Time 관련 링크/권한 없음, deep/strict 서명 통과. 업로드·재심사는 인증 및 공개 정책 승인 대기다.

최종 후보는 **0.1.0(12)**다. 빌드 11과 동일한 개인정보 UI에 불필요한 자체 UserDefaults 사유 정리를 포함한다. 앱/위젯 12, deep/strict 서명, 10개 Mach-O의 Screen Time 링크 없음, 13개 privacy manifest 검사, 실제 번들의 정책/문의 및 승인 픽셀/자동 휴식 보존 검증을 통과했다. 자료: `native-features-build12.json`, `screen-time-audit-build12.json`, `privacy-manifests-build12.json`.
