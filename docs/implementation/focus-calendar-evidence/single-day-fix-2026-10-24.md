# 냐우포커스 하루 일정이 이틀로 표시되는 문제

## 원인과 수정

`FocusCalendar.swift`가 종일 일정의 종료 시각에 다음 날 0시를 지정했다. 새 `EKEvent`에서는 이후 `isAllDay = true`를 지정하면서 당일 마지막 초로 정규화되지만, 이미 종일 일정인 객체를 같은 코드로 갱신하면 다음 날 마지막 초로 정규화된다. 종료 시각 비교도 정규화 전의 다음 날 0시와 비교하므로 변경 없는 일정까지 다시 저장했다.

조회 구간 `[당일 0시, 다음 날 0시)`는 유지한다. 저장·비교에는 다음 날 시작에서 1초를 뺀 시각을 사용하고 종일 상태를 먼저 지정한다. 다음 날 시작은 기존처럼 Calendar의 civil-day 연산으로 계산하므로 서머타임의 23시간·25시간짜리 날짜도 처리한다. 기존 소유 URL과 전용 캘린더 조회 범위를 유지하며, 이미 이틀로 늘어난 자체 생성 일정도 다음 정상 연동에서 같은 일정의 날짜를 수정한다.

## 재현 및 회귀 검사

`apps/mobile/tests/native/CalendarDates.swift`를 실제 운영 소스 `FocusCalendar.swift`와 함께 컴파일해 iOS 27.0 (24A434) 시뮬레이터의 EventKit에서 실행했다. 별도 모형이나 날짜 setter의 복제 구현으로 수정 결과를 검사하지 않는다. 기존 setter 순서를 두 번 실행해 이틀짜리 객체를 만드는 재현 조건도 각 사례에서 확인한다.

명령:

```sh
pnpm --filter @neowfocus/mobile test:calendar-dates A1185F63-D2E2-4471-9612-A647145F5CAC
```

실행 결과:

```text
PASS: Asia/Seoul 2026-10-23 (24h): repair, creation, 20 updates, stable date guard
PASS: Asia/Seoul 2026-10-31 (24h): repair, creation, 20 updates, stable date guard
PASS: Asia/Seoul 2026-12-31 (24h): repair, creation, 20 updates, stable date guard
PASS: Asia/Seoul 2028-2-29 (24h): repair, creation, 20 updates, stable date guard
PASS: America/Los_Angeles 2026-3-8 (23h): repair, creation, 20 updates, stable date guard
PASS: America/Los_Angeles 2026-11-1 (25h): repair, creation, 20 updates, stable date guard
PASS: 6 civil-day cases using production date setters and real EventKit; no calendar reads or writes
```

모든 EventKit 객체는 저장하지 않은 테스트 객체다. 사용자 캘린더 조회·저장, 권한 요청, 실제 계정의 iCloud 왕복 동기화는 이 검사에서 수행하지 않는다. 기존 실계정 일정의 복구 완료나 다른 기기로의 반영을 확인한 것은 아니다.

모바일 TypeScript 검사와 전체 앱의 iOS Release 시뮬레이터 빌드도 통과했다. 빌드 로그: `apps/mobile/build-output/calendar-single-day-build.log` (`BUILD SUCCEEDED`).

## 배포 상태

기존 TestFlight 0.1.1(15)에는 포함되지 않는다. 수정 빌드 **0.1.1(16)**은 2026-10-25 21:28 KST Xcode Organizer로 업로드했고, App Store Connect에서 처리 완료·기존 내부 그룹 2명 연결·한국어 테스트 안내 저장을 확인했다. 수정 빌드 실기기 설치 및 실계정 기존 일정 복구는 아직 확인하지 않았다. [빌드 16 배포 기록](../../release/2026-10-24/ios-0.1.1-16/README.md) 참조.
