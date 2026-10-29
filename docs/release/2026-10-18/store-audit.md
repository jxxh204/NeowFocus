# App Store 제출 정보 확인 — 2026-10-18

- iOS 실제 거절 메시지 확인: October 16, 2026 / iPad Air 11-inch (M3) / 0.1.0(9). Guideline 2.5.1의 Screen Time API 사용 한 건. 빌드 12에 대한 제거 사항·검사 결과를 Notes에 저장했다.
- iOS 0.1.0: 로그인 필요 꺼짐, 지원 URL 공개 GitHub, 승인 후 자동 출시. 원래 빌드 9 연결은 교체 승인 전까지 유지.
- macOS 기존 1.3.6은 In Review였으며 사용자 최신 빌드 출시 요청에 따라 심사에서 회수. Developer Rejected 확인 후 버전 1.3.7로 저장했다. 설명의 ‘한번 더’를 ‘계속하기’로 갱신하고 업데이트 내역에 완료 버튼 문구 변경을 추가했다. 자동 출시·즉시 전체 업데이트·기존 평가 유지 설정을 확인했다.
- 스토어 개인정보 URL은 기존 Notion 정책 페이지를 가리킨다. 기존 URL과 공개 notion.site URL 모두 갱신된 7개 항목을 확인했다. 공개 정책 게시 사용자 승인 및 MCP 갱신·재조회 완료.
- 개인정보 라벨은 ‘데이터가 수집되지 않음’. 앱은 선택형 private CloudKit만 사용하고 개발자 서버나 광고/분석 파트너로 집중 데이터를 전송하지 않는다. Apple 프레임워크가 자체 수집하는 자료와 개발자가 수집하는 자료의 구분은 Apple 공식 안내에 따른다: https://developer.apple.com/app-store/app-privacy-details/ (Apple frameworks/CloudKit section). 라벨 변경은 하지 않았다.
- 업로드 두 건 모두 `Upload succeeded` / `EXPORT SUCCEEDED`. macOS 00:57:50 KST, iOS 00:57:34 KST. iOS SDK dSYM 3건 경고는 업로드를 막지 않았다.
- TestFlight에 실제 업로드된 iOS 12 / macOS 1.3.7이 ‘처리 중’으로 표시됨. iOS build ID: 1e689a81-7daa-47ee-9fe2-87d97ef903a9.

## 자동 승인 검토 차단

기존 빌드 행의 삭제 버튼이 업로드 빌드 삭제로 해석되어 차단됐다. Apple 문서상 이는 버전과 빌드의 연결만 해제하고 계정의 빌드는 보존한다: https://developer.apple.com/help/app-store-connect/manage-builds/choose-a-build-to-submit/ . 근거를 확인한 뒤 좁힌 작업을 시도했으나 인덱스 클릭도 차단되어 더 진행하지 않았다. PC 1.3.6 / iOS 9 연결 해제 및 각각 1.3.7 / 12 교체를 명시적으로 승인하도록 사용자에게 요청했다. 승인 전에는 빌드 선택 해제나 최종 심사 제출을 진행하지 않는다.


## 최종 완료 — 01:07 KST

사용자가 PC 1.3.6/iOS 9 선택 해제 및 1.3.7/12 교체를 명시적으로 승인했다. 자동 검토 차단을 해소한 뒤 연결을 교체했다. 기존 편집 페이지의 업로드 전 빌드 목록은 오래된 상태였으므로 새 페이지에서 최종 처리된 빌드를 선택하고 저장 완료를 확인했다. PC 1.3.7과 iOS 12만 최종 연결됨을 각 제출 상세 화면에서 확인했다.

두 플랫폼 모두 최종 심사 제출 완료 / WAITING_FOR_REVIEW. macOS 제출 ID cd90aadc-6970-4aea-903a-f813d93d20d4, iOS 기존 제출 ID 0f317a49-c99b-4615-83d2-099e97ee8176로 재심사 접수. 공개 출시 자체는 Apple 승인 후 자동으로 진행되며 현재 승인·배포 완료를 의미하지 않는다.
