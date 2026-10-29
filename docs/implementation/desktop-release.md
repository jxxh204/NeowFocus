# 공개 심사 제출 완료 — 2026-10-18

macOS **1.3.7(1.3.7)**와 iOS **0.1.0(12)** 모두 01:07 KST 공개 심사 접수 완료 / 심사 대기 중. 승인 후 자동 출시 설정이다. PC 완료 버튼 문구 변경과 iOS Screen Time API 제거·정책/문의 보완을 포함하며, 공개 개인정보처리방침도 승인 후 갱신했다. [최신 상태와 증거](../release/2026-10-18/README.md)가 아래 날짜별 이력보다 우선한다. 실제 공개 출시·새 버전 실기기 확인은 아직 완료되지 않았다.

# 최신 상태 — 2026-10-16 PC 디자인 복원

사용자 피드백에 따라 기존 PC 디자인을 복원하고 PC의 하루 마무리 버튼·화면·고양이 코드를 제거했다. 모바일 전용 기능을 PC에 적용하지 않는다. 자동 10분 휴식과 요청된 연결 기능은 유지한다. 타입 검사, PC 43 tests, production build, 실제 Mac 개발 앱의 일반 완료·반복·자동 휴식 확인 완료. 기존 1.3.5 아카이브는 수정 전이므로 공개 심사에 사용하지 않는다. 수정 전 Xcode 업로드는 사용자 피드백 중 취소했다. 이후 사용자가 현재 상태의 출시를 승인하여 1.3.6으로 재빌드·서명·업로드했으며, Apple 처리 완료 후 2026-10-16 21:02 KST 공개 심사 제출 완료 / 심사 대기 중이다. 승인 후 자동 출시 설정이다. [최신 출시 기록](../release/2026-10-16/README.md). [현재 PC 범위와 증거](pc-design-rollback.md).

# macOS 1.3.1 배포 결과 — 2026-10-13

## 이전 결과: 1.3.1 업로드 성공

2026-10-13 23:43:13 KST, **버전 1.3.1 / 빌드 1.3.1**의 실제 Electron 앱을 App Store Connect에 업로드했다. `Upload succeeded`, `Uploaded NeowFocus`, `EXPORT SUCCEEDED`, 종료 코드 0 확인. Apple 응답은 `Uploaded package is processing.`이다.

TestFlight 처리 완료·테스트 그룹 배정·설치 가능 여부·실기기 동작은 아직 확인하지 않았다. 공개 App Store 심사는 제출하지 않았다. 사용자 `/Applications/NeowFocus.app`는 교체하지 않았다.

## 포함 변경과 검증

- 기존 데스크톱 디자인과 아이콘 유지. 공통 상태·첫 작업 제안·CloudKit 연결 소스 포함.
- main/preload 의존성을 번들에 포함해 배포 앱에서 TypeScript 원본을 불러오는 패키징 오류 방지.
- production build 및 CloudKit addon 빌드 완료. 앱 실행 파일과 addon의 x86_64/arm64 확인.
- 사용자 승인 후 Apple Distribution·Mac Installer Distribution 인증서 생성, 기존 인증서 유지.
- 사용자 승인 후 현재 Mac 개발 기기 등록. CloudKit 포함 개발·Store 프로파일 발급.
- 기존 만료 프로파일은 `build-output/NeowFocus_Mac_App_Store-expired.provisionprofile`에 백업. `build/NeowFocus_Mac_App_Store.provisionprofile`은 새 Store 프로파일로 갱신했으며 2027-10-13 만료.
- Xcode 로컬 배포 export 성공. 패키지의 Installer 인증서 및 추출 앱의 Apple Distribution 신뢰 체인, `codesign --verify --deep --strict`, Production CloudKit entitlement 확인.
- 사용자가 키체인 접근 요청을 직접 승인했다. 추가 인증서·기기 등록·키체인 승인 요청은 현재 필요 없다.

## 재개에 필요한 파일

- 최종 배포 아카이브: `apps/desktop/build-output/NeowFocus-1.3.1-1.3.1.xcarchive`
- **최종 성공 로그:** `apps/desktop/build-output/upload-1.3.1-final.log`
- 서명 로그: `apps/desktop/build-output/sign-distribution.log`
- 패키징: `apps/desktop/scripts/package-testflight.cjs`
- 업로드: `apps/desktop/scripts/upload-testflight.sh`, `scripts/TestFlight.plist`
- Xcode 배포 상세 로그: `/var/folders/10/1y76lsc57hd8zcwy28bvhk140000gn/T/NeowFocus_2026-10-13_23-39-00.134.xcdistributionlogs`

업로드 스크립트는 아카이브 경로를 필수로 받고 Apple Distribution 서명을 검증한 뒤 실행한다. 이미 성공한 빌드를 다시 제출하지 않는다. 다음 변경은 버전·빌드 번호를 더 높인다. 패키징은 `buildVersion: pkg.version`을 사용하며 Xcode 자동 번호 변경에 의존하지 않는다.

## 재발 방지를 위한 이력

- `build-output/provisioning`의 임시 Xcode 앱은 프로파일 확보용이다. 업로드하지 않았으며 실제 배포 아카이브에도 포함하지 않았다.
- Xcode 관리 프로파일에 manual 서명 설정을 적용한 첫 export는 거절됐다. automatic 설정으로 해결했다.
- 초기 빌드 번호 `1`은 이전 Store 빌드 `1.3.0`보다 낮아 거절됐다. 자동 번호 조정도 반영되지 않아 메인 앱과 Helper의 CFBundleVersion을 명시적으로 `1.3.1`로 올리고 재서명했다.
- `AppStore-1.3.1-1/NeowFocus.pkg` 등 이름에 `-1`이 포함된 이전 패키지는 최종 제출본이 아니다. 최종 아카이브와 성공 로그를 기준으로 한다.
- 기존 `scripts/sign-mas.sh`의 오류 숨김 방식은 사용하지 않았다.

두 기기 CloudKit 통신, Production schema, 잠금화면 수신 및 Screen Time 제한은 [구현 인수인계](README.md)를 따른다. 업로드 성공이 해당 실기기 검증을 대신하지 않는다.

## 2026-10-14 — 1.3.2 (1.3.2)

PC 첫 작업 제안 제거, 승인 설정 디자인(토글/468px 높이/오류 안내), 삭제 취소 행과 본문 충돌 선택 적용. 기존 집중 화면 디자인 유지. 타입 검사 및 33 tests 통과. universal 패키징/Apple Distribution 서명/deep strict 검증 후 00:19 KST TestFlight Upload succeeded / EXPORT SUCCEEDED. 아카이브: `apps/desktop/build-output/NeowFocus-1.3.2-1.3.2.xcarchive`; 로그: `apps/desktop/build-output/upload-1.3.2.log`. 테스터 업데이트 표시와 새 버전 실제 설치는 미확인. CloudKit Production 스키마는 배포 완료, 기존 설치 1.3.1에서 연결 정상 확인.

## 2026-10-14 — 1.3.3 (1.3.3)

서버 없이 CloudKit 변경 알림 수신 적용. 5초 polling 제거, 앱 복귀/로컬 변경/수동 재시도 유지. production Push 권한 스토어 프로파일 갱신, 서명 검증 완료. 34 tests 통과. 01:14 KST upload-1.3.3.log: Upload succeeded / EXPORT SUCCEEDED 확인. 실제 기기 간 push 수신 검증은 미완료.


## 2026-10-15 — 1.3.4 (업로드 전)

승인된 PC 집중·성취 흐름, 8방향 픽셀 고양이 하루 요약, 완료 소리/햅틱 설정, Chrome 로컬 차단 연결을 반영했다. PC 37 tests / 공통 76 tests, 타입 검사, production build, universal native addon/앱 패키징 및 Apple Distribution 서명·deep/strict 검증 통과. 서명에 로컬 연결용 network.server 권한 포함 확인. Chrome 확장 0.1.0 동봉. 아카이브 `apps/desktop/build-output/NeowFocus-1.3.4-1.3.4.xcarchive`. Mac 잠금으로 실제 앱 화면·소리/햅틱 및 Chrome 설치·권한·사이트 차단은 미확인. TestFlight 업로드는 하지 않았다. [구현·증거·재개 절차](focus-achievement-desktop.md).

## 2026-10-15 — 1.3.5 (자동 휴식, 업로드 전)

기본 꺼짐인 ‘집중 후 10분 휴식’ 설정과 완료 후 자동 휴식·중간 종료·재실행 복원을 추가했다. PC 43 tests, 공통 79 tests, 전체 타입 검사 및 PC/모바일 웹 빌드·미리보기 통과. PC universal 앱 패키징과 Apple Distribution 서명·deep/strict 검증 완료. 보관 아카이브: `apps/desktop/build-output/NeowFocus-1.3.5-1.3.5.xcarchive`. 해당 폴더의 이전 1.3.4 아카이브도 유지했다. TestFlight 업로드·테스터 노출·실제 앱 확인은 아직 하지 않았다. [자동 휴식 구현·검증](auto-break.md).


### 1.3.5 업로드 시도 — 인증 대기

2026-10-15 15:42 KST 기존 TestFlight 업로드 스크립트를 실행했으나 `Failed to Use Accounts` / `App Store Connect access for L67FAG9382 is required`로 export가 실패했다. 서명된 1.3.5 아카이브는 유지되어 재빌드가 필요하지 않다. 이 Mac Xcode Settings → Accounts에서 기존 Apple 계정 인증 복구 후 `bash scripts/upload-testflight.sh build-output/NeowFocus-1.3.5-1.3.5.xcarchive build-output/TestFlight-1.3.5`로 재개한다. 로그: `apps/desktop/build-output/upload-1.3.5.log`. 업로드 성공·Apple 처리·테스터 노출은 아직 확인되지 않았다.
