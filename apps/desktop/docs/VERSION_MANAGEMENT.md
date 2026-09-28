# 버전 관리 가이드

## Semantic Versioning (SemVer)

버전 형식: `MAJOR.MINOR.PATCH` (예: 1.2.3)

### 각 버전 번호의 의미

#### PATCH (세 번째 숫자)
**언제 증가:** 버그 수정, 성능 개선
- 타이머 멈춤 버그 수정
- 알림이 안 뜨는 문제 해결
- 메모리 누수 수정
- 텍스트 오타 수정
- UI 미세 조정

**영향:** 작음 - 사용 방법 동일

#### MINOR (두 번째 숫자)
**언제 증가:** 새 기능 추가 (기존 기능 유지)
- 새 타이머 모드 추가 (Short break, Long break)
- 통계 기능 추가
- 테마 추가
- 설정 옵션 추가
- 키보드 단축키 추가

**영향:** 중간 - 새로운 기능 사용 가능

#### MAJOR (첫 번째 숫자)
**언제 증가:** Breaking changes (기존 기능 변경/제거)
- UI 전체 재설계
- 데이터 형식 변경 (기존 저장 데이터 호환 안됨)
- 주요 기능 제거/대체
- 사용 방법 크게 변경

**영향:** 큼 - 사용자가 적응 필요

## 사용 방법

### 1. 버전만 변경 (빌드 없이)

```bash
# Patch 버전 증가 (0.1.112 → 0.1.113)
pnpm run version:patch

# Minor 버전 증가 (0.1.112 → 0.2.0)
pnpm run version:minor

# Major 버전 증가 (0.1.112 → 1.0.0)
pnpm run version:major
```

### 2. 버전 변경 + MAS 빌드

```bash
# Patch 버전으로 빌드 (기본 - 버그 수정용)
pnpm run build:mas

# Minor 버전으로 빌드 (새 기능 추가용)
pnpm run build:mas:minor

# Major 버전으로 빌드 (대규모 변경용)
pnpm run build:mas:major
```

### 3. PKG 생성 (App Store 제출용)

```bash
# 현재 버전으로 PKG 생성
pnpm run build:pkg
```

## 자동 버전 증가 규칙

### Git 커밋 메시지 기반 자동 판단 (권장)

커밋 메시지 키워드를 보고 자동으로 버전 타입을 결정:

**PATCH (버그 수정):**
- `fix:` - 버그 수정
- `perf:` - 성능 개선
- `refactor:` - 코드 리팩토링
- `style:` - 스타일 수정
- `docs:` - 문서 수정

**MINOR (기능 추가):**
- `feat:` - 새 기능
- `add:` - 새 기능/파일 추가

**MAJOR (Breaking Change):**
- `BREAKING CHANGE:` in commit body
- `!` after type (예: `feat!:`)

### 예시

```bash
# Patch 버전 증가 (0.1.112 → 0.1.113)
git commit -m "fix: 타이머 알림 버그 수정"
pnpm run build:mas

# Minor 버전 증가 (0.1.112 → 0.2.0)
git commit -m "feat: 통계 기능 추가"
pnpm run build:mas:minor

# Major 버전 증가 (0.1.112 → 1.0.0)
git commit -m "feat!: 데이터 형식 변경"
pnpm run build:mas:major
```

## 베타 → 정식 출시 로드맵

### Phase 1: Beta (0.x.x)
```
0.1.0  - 초기 릴리스
0.1.x  - 버그 수정
0.2.0  - 통계 기능 추가
0.3.0  - 테마 기능 추가
0.x.x  - 기능 추가 및 안정화
```

### Phase 2: 정식 출시 (1.0.0)
```
1.0.0  - 정식 출시 (기능 완성, 안정화)
1.0.x  - 버그 수정
1.1.0  - 새 기능
2.0.0  - 대규모 업데이트
```

## 주의사항

1. **MAS는 Apple이 업데이트 관리** - 사용자에게 자동 배포
2. **심사 시간 고려** - 보통 1-3일 소요
3. **버전은 항상 증가만** - 이전 버전으로 되돌릴 수 없음
4. **TestFlight 베타** - 정식 출시 전 테스트 가능

## 참고

- SemVer 공식 문서: https://semver.org/lang/ko/
- Conventional Commits: https://www.conventionalcommits.org/ko/
