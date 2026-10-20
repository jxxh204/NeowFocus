# 모바일 집중과 하루 마무리

2026-10-14 사용자 승인 기획을 모바일 앱에 반영했다. 고양이는 **‘오늘은 여기까지’로 하루를 마무리할 때만** 나온다.

- 집중 한 번 완료: 기존 `icon_paw_white.svg` 전체를 그대로 사용하는 정지 발자국. 모양·원래 각도를 유지하며 애니메이션은 없다. 완료 시 짧은 소리와 부드러운 진동 한 번은 유지한다. 알림 설정을 끄면 재생하지 않는다.
- 하루 마무리: GPT Image로 생성한 8프레임 고양이의 뒷모습이 위·아래·좌·우 및 네 대각선 중 한 곳에서 나와 도장을 찍고 같은 방향으로 사라진다. 직전 등장 방향은 설정에 저장하고 다음 선택에서 제외한다. 도장 중심을 실제 화면에서 측정해 앞발 접촉 위치를 맞춘다. 하루 도장만 16×16 픽셀 마스크를 사용한다. 회전은 같은 앞발 좌표와 등장 방향을 기준으로 계산한다. 일반 집중 완료와 대기 화면은 원본 SVG 그대로다.
- 오늘 집중 횟수를 세면서 도장 한 개만 남긴다. 30회가 넘으면 최대 30번의 동작에 나누어 세고 최종 횟수는 정확히 표시한다. 이 동작에는 추가 소리·진동이 없다.
- 동작 줄이기와 백그라운드 전환은 움직임을 생략/중단하고 최종 도장과 횟수를 남긴다. 복귀나 시트 닫기로 재생하지 않는다.

`index.html`은 Expo 모바일 화면을 390px 너비로 보여준다. `pixel-animation.html`은 고양이 동작 한 번만 살펴보는 별도 미리보기다. 실제 앱의 횟수·기록 로직 검증은 Expo 화면에서 한다. 브라우저에서는 소리와 진동을 재생하지 않는다.

## 이미지

현재 사용하는 원본은 `apps/mobile/assets/completion-pixel/cat-stamp-pixel-v1.png`다. GPT Image로 생성한 1254×1254 RGBA 스프라이트 시트이며 얼굴·꼬리·뒷다리가 없는 상체 뒷모습이다. 이미지를 다시 그리는 후처리는 하지 않았고, 프레임별 잘라내기 좌표와 등 부분 기준점을 JSON에 기록했다. 생성 기록은 `generation-pixel-v1.json`에 보관했다.

실사 v2 이미지와 이전 녹화는 탐색 과정의 자료다. 이전 `iphone-completion-v2.*`, `iphone-animation-v2.gif`, `iphone-pixel-original-paw.mp4`는 현재의 하루 전용 조건과 현재 발자국과 8방향 동작을 증명하는 자료가 아니다.

## 현재 검증

- 코어 76개 테스트, 모바일 TypeScript 검사, 관련 데스크톱 회귀 테스트 15개 통과.
- iPhone 17e / iOS 27 시뮬레이터용 네이티브 빌드 성공.
- 실제 모바일 소스의 Expo 웹 렌더링에서 시작→일시정지→짧은 집중 완료→같은 작업 준비→하루 마무리→휴식→다시 시작, 기록 유지 확인.
- 최신 화면: `iphone-original-paw-current.png`는 iPhone 17e 시뮬레이터의 원본 발자국 완료 화면이다. `mobile-focus-original-paw.png`와 `mobile-day-original-paw.png`는 390×844 웹 렌더링 캡처다. 이전 도트 캡처는 현재 화면이 아니다.
- `node apps/mobile/scripts/check-completion-geometry.cjs`: 일반 완료 원본 SVG 전체 동일성, 48개 화면 크기·도장 위치·방향 조합의 접촉 정렬, 잘린 등 부분의 화면 밖 배치, 완전한 진입/퇴장, 직전 방향 제외 검사 통과.
- `node apps/mobile/scripts/export-completion-preview.cjs`로 앱 위치 계산과 원본 SVG를 독립 동작 미리보기에 갱신한다.

실제 iPhone의 소리·진동, 잠금화면·위젯 동작은 기기 검증이 남아 있다. 앱 차단은 배포 프로파일에 Family Controls 권한이 없어 비활성 상태다. TestFlight 업로드는 하지 않았다. 상세 구현 인계는 `../../implementation/focus-achievement-mobile.md`를 참고한다.

최종 사용자 구분: 일반 완료 = 기존 아이콘, 고양이가 찍는 하루 마무리 = 픽셀 도장. `assets/completion-pixel/paw-mask.ts`를 앱과 독립 미리보기에서 공유한다. 이전 `mobile-day-original-paw.png`는 변경 전 하루 화면이다.

승인 후 앱 적용 검증: 모바일 타입 검사, iOS Hermes 번들 내보내기, iPhone 17e / iOS 27 Debug 빌드 통과. Expo 앱 소스에서 기존 아이콘 일반 완료→8방향 고양이→픽셀 도장과 정확한 최종 횟수를 확인했다. 최신 하루 웹 캡처는 `mobile-day-pixel-paw-current.png`, 독립 동작 미리보기는 `day-pixel-paw-preview-current.png`다.
