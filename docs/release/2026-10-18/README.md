# PC·iOS 공개 심사 제출 완료 — 2026-10-18

**macOS 1.3.7(1.3.7), iOS 0.1.0(12) 모두 01:07 KST 공개 심사 접수 완료 / 심사 대기 중. 승인 후 자동 출시 설정이다. 아직 Apple 승인·공개 출시·새 버전 실기기 동작을 확인한 것은 아니다.**

| 플랫폼 | 최종 빌드 | 제출 ID | 상태 |
| --- | --- | --- | --- |
| macOS | 1.3.7(1.3.7) | cd90aadc-6970-4aea-903a-f813d93d20d4 | 심사 대기 중 |
| iOS | 0.1.0(12) | 0f317a49-c99b-4615-83d2-099e97ee8176 | 심사 대기 중 |

## 포함 사항과 검증

- PC 완료 버튼 ‘새 작업’ → ‘다른 작업’, ‘타이머 한번 더’ → ‘계속하기’. 기존 PC 디자인 유지. 일반 발자국 유지, PC 하루 마무리/고양이 미포함. 이전 1.3.6 제출 source manifest 대비 package.json 버전과 ko.json 문구만 변경됐다.
- PC 타입 검사·production build·native addon·universal 패키징·Apple Distribution 서명·deep/strict 검사 통과. 실제 app.asar의 두 새 문구와 이전 반복 문구 제거 확인.
- iOS 빌드 12 Screen Time 미포함·실제 서명 검사 재통과. 모바일 및 공통 소스 60개가 보관 manifest와 일치해 재빌드하지 않았다. 앱 내 개인정보처리방침·문의 경로, 자동 10분 휴식과 모바일 하루 마무리 픽셀 고양이를 포함한다.
- 사용자 승인한 공개 개인정보처리방침을 기존 Notion 페이지에 게시하고 MCP 재조회 및 두 공개 URL에서 실제 내용 확인. 페이지 제목/공유 범위 유지.
- 스토어 설명과 심사 메모 확인. PC 설명과 업데이트 내역에 새 문구 반영. iOS Notes에 API 완전 제거와 정책/문의 경로 반영. 로그인 필수 꺼짐, 승인 후 자동 출시를 확인했다.

## 전달·심사 증거

- PC `00:57:50 KST Upload succeeded / EXPORT SUCCEEDED`, iOS `00:57:34 KST Upload succeeded / EXPORT SUCCEEDED`. iOS SDK dSYM 3건 경고는 업로드를 막지 않았다.
- Apple 처리 완료 뒤 실제 최신 빌드만 연결했다. macOS build ID `2a707c2f-31df-4f9d-b5a7-ef2bc9fdf7a8`, iOS build ID `1e689a81-7daa-47ee-9fe2-87d97ef903a9`.
- 사용자가 기존 빌드 연결 해제와 교체를 명시적으로 승인한 후 PC 1.3.6 / iOS 9 선택을 해제했다. 이전 빌드 자체는 계정에 보존된다. PC 기존 1.3.6 심사는 회수 이력으로 남는다.
- iOS ‘심사 업데이트’ 뒤 ‘앱 심사에 다시 제출’, PC ‘심사에 추가’ 뒤 ‘심사를 위해 제출’을 완료했다. 두 최종 상세 화면의 정확한 빌드·심사 대기 중·제출 ID를 확인했다.

[PC 제출 증거](evidence/macos-build137-review-submitted.png), [iOS 재심사 증거](evidence/ios-build12-review-submitted.png), [공개 정책 갱신](evidence/public-policy-updated.png). 기계 판독 상태: release-status.json. 검사·심사 정보: store-audit.md / macos-build137-audit.json / ios-build12-audit.json.

현재 사용자의 추가 승인이나 재로그인은 필요하지 않다. 다음 상태는 Apple 심사 결과에 달려 있으며 별도 자동 모니터링은 설정하지 않았다.
