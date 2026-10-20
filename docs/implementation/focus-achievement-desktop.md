# 2026-10-16 정정 — 아래 PC 확장 범위는 폐기

사용자는 PC 디자인 복원을 요청했고 ‘오늘은 여기까지’는 PC에 없던 기능이라고 명시했다. PC 하루 요약·픽셀 고양이·관련 자산은 제거했다. 아래 문서는 범위를 잘못 확대한 당시의 이력이며 현재 승인 범위로 사용하지 않는다. [현재 PC 디자인과 검증](pc-design-rollback.md)을 따른다.

# PC 집중·성취 흐름 — 1.3.4 검증 인계

후속 변경: 기본 꺼짐인 [자동 10분 휴식](auto-break.md)을 PC 1.3.5 소스에 추가했다. 아래 수치와 1.3.4 아카이브는 휴식 추가 전의 검증 이력이다.

2026-10-15. 승인 기획은 [집중·성취 시안](../design-review/desktop/focus-achievement-plan.html), 이후 사용자의 일반 완료 발자국 유지·하루 마무리 픽셀 도장·8방향 고양이·Chrome 선택을 반영했다.

## 구현

- 처음 준비 화면에서 짧은 집중 단위 안내. 작업 입력 → 선택 시간 → 시작. 기존 402px 작은 창과 색/고양이/발자국을 유지한다.
- 집중·일시정지·작은 창은 작업과 게이지 중심으로 표시하고 남은 시간 숫자를 숨긴다. 일시정지는 별도 상태와 재개 버튼으로 구분한다.
- 일반 완료는 **기존 `icon_paw_white.svg` 원본 그대로**, 정적인 발자국과 오늘 누적 횟수를 표시한다. 고양이 애니메이션을 재생하지 않는다.
- ‘한번 더’는 직전 작업과 **직전 선택 시간**으로 준비한다. 자동 시작하지 않는다. 새 작업은 작업명만 비우고 기록을 유지한다.
- ‘오늘은 여기까지’는 잠시 460×460 창으로 넓혀 당일 횟수·실제 집중 시간·고유 작업을 표시한다. 승인된 픽셀 고양이가 8방향 중 직전 방향을 제외하고 등장하며, 해당 방향으로 픽셀 도장을 찍고 같은 곳으로 퇴장한다. 일반 완료 아이콘에는 영향을 주지 않는다.
- 애니메이션은 최대 30번으로 묶어도 마지막 횟수는 실제 합계와 일치한다. 모션 줄이기·화면 숨김에는 즉시 최종 상태로 이동한다. 배경 복귀 시 재생을 반복하지 않는다.
- 계속하기는 같은 작업으로 준비, 오늘 마무리는 당일 휴식 상태. 기록을 삭제하지 않으며 다음 집중도 가능하다. 날짜가 바뀌면 휴식이 풀린다.
- 새 로컬 완료에만 소리와 Mac 햅틱을 한 번 요청한다. 설정 누락은 켜짐, 명시적으로 끈 값은 유지한다. 복원·이전 완료·동기화 완료·하루 요약에는 추가 요청하지 않는다. 지원하지 않는 Mac/입력 장치에서는 햅틱이 없을 수 있다.

## Chrome 차단

설정 → 집중 중 사이트 차단에서 최대 30개 도메인을 선택한다. 앱에 포함된 Chrome 확장을 사용하며, [설치와 연결 안내](../../apps/desktop/chrome-extension/README.md)를 따른다. Chrome 웹 스토어 배포는 하지 않았다. 확장 설치와 선택 사이트 접근 권한 승인이 별도로 필요하다.

앱은 `127.0.0.1:42731`에서만 인증된 확장과 연결한다. 선택 도메인·집중 여부·만료 시각만 공유하며 작업명·집중 기록·방문 URL은 보내지 않는다. 연결 코드는 앱 사용자 데이터의 0600 파일과 Chrome 로컬 저장소에 보관한다. 외부 서버·시스템 프록시·hosts 변경은 없다.

확장은 사용자가 허용한 사이트의 상위 페이지 이동만 session 규칙으로 제한한다. 이미 열린 선택 사이트도 차단 안내로 바뀌며 원래 페이지는 자동 복구하지 않는다. 일시정지·완료·끄기·연결 종료에 해제하고, 렌더러 응답이 끊기면 10초 유효기간을 넘겨 차단 정책을 유지하지 않는다. OS 절전/Chrome 백그라운드 중 타이머 실행 시점은 실제 환경 검증이 남아 있다. 시크릿 모드와 Chrome 외 앱/브라우저에는 적용하지 않는다.

Chrome 공식 근거: [WebSocket과 확장 서비스 워커](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets), [declarativeNetRequest와 호스트 권한](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest). 최소 Chrome 120, 앱/확장 heartbeat 2초. 이는 CloudKit 조회 polling과 별개이며 기존 CloudKit 변경 알림 방식은 유지한다.

## 확인한 범위

| 검증 | 결과 |
| --- | --- |
| PC main/preload/renderer 타입 검사 | 통과 |
| PC Jest | 6 suites / 37 tests 통과 |
| 공통 집중·성취·동기화 정책 | 7 files / 76 tests 통과 |
| Chrome 선택·허용 도메인/session 규칙 | 1 test 통과 |
| 8방향 발 접점·회전·상체 잘림·완전 퇴장 | 32 viewport/target/direction 조합 통과, 연속 방향 제외 확인 |
| Production renderer 빌드 | 통과 |
| 실제 renderer를 HTTP로 연 브라우저 검증 | 첫 안내, 45분 작업 시작, 숫자 없는 집중/정지/재개, 완료 원본 발자국, 재준비, 하루 요약, 휴식 저장, 알림 끄기 저장 확인 |
| 설정/사이트 화면 잘림 | 본문 높이와 scrollHeight 일치 (540 / 466px) |
| 디자인 수동 detector | 변경한 화면 5개에서 발견 항목 없음 |
| macOS addon·앱 패키징 | x86_64 + arm64 universal, 버전/빌드 1.3.4, 확장 동봉 |
| Apple Distribution 서명·deep/strict 검증 | 통과, network.client/server 및 Production CloudKit 권한 확인 |
| 실제 Mac 앱 화면·소리/햅틱 | **미확인: Mac 잠금 상태** |
| 실제 Chrome 확장 설치/권한/차단 | **미확인: 설치·권한 승인 전** |
| TestFlight 1.3.4 | **업로드하지 않음** |

브라우저 미리보기는 Electron IPC/CloudKit/실제 창 크기 변경/네이티브 알림을 검증하지 않는다. 사용자 설치 앱과 실제 기록은 교체하지 않았다. 네이티브 개발 앱은 `/private/tmp/neowfocus-pc-achievement-user-data`의 별도 데이터로 실행 후 종료했다.

미리보기 증거: [도장 찍는 순간](evidence/desktop-1.3.4/cat-stamping-browser.png), [요약](evidence/desktop-1.3.4/day-summary-browser.png), [설정](evidence/desktop-1.3.4/settings-browser.png), [Chrome 설정](evidence/desktop-1.3.4/chrome-settings-browser.png). 배경은 브라우저 렌더링이며 실제 Mac vibrancy와 다르다.

## 산출물과 재개

- 서명 아카이브: `apps/desktop/build-output/NeowFocus-1.3.4-1.3.4.xcarchive` (Store 배포용, 직접 설치 검증 아님).
- 확장 ZIP: `apps/desktop/build-output/NeowFocus-Chrome-0.1.0.zip`.
- 빌드/테스트/서명 로그: `apps/desktop/build-output/{build,tests,typecheck,package,sign,sign-verify}-1.3.4.log`.
- 권한 결과: `apps/desktop/build-output/entitlements-1.3.4.txt`.
- 재검증 명령 (desktop 폴더): `pnpm run typecheck`, `pnpm exec jest --runInBand`, `node --test scripts/tests/chrome-rules.mjs`, `node scripts/tests/completion-geometry.cjs`.

잠금 해제 후 실제 앱에서 일반/작은 창 → 완료 → 하루 요약 → 계속/휴식의 크기 전환과 완료 소리/트랙패드 햅틱을 확인한다. 기존 사용자 데이터를 쓰지 않고 위 별도 테스트 데이터 경로를 유지한다. Chrome 설치/선택 사이트 접근에 대한 사용자 승인 후 선택한 테스트 도메인만 시작 시 차단, 일시정지/완료/종료/연결 손실 시 해제, 비선택 사이트와 다른 프로필 유지, 재실행·절전 복귀·권한 거절/철회를 확인한다. 새 코드 복사/확장 폴더 열기도 실제 앱에서 확인해야 한다.

위 확인이 끝나면 이 아카이브로 TestFlight 업로드를 진행하고 Apple 처리·테스터 노출·실설치는 각각 별도로 기록한다. 1.3.3의 과거 성공 로그를 1.3.4 성공 증거로 사용하지 않는다.
