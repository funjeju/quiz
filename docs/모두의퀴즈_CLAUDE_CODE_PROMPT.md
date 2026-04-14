# 모두의퀴즈 — Claude Code 마스터 실행 지시서 (CLAUDE_CODE_PROMPT.md)

> **이 파일을 Claude Code에 첫 메시지로 전달하세요.**  
> 모든 설계 문서를 읽은 후 이 지시에 따라 전체 프로젝트를 개발합니다.

---

## 프로젝트 개요

**서비스명**: 모두의퀴즈 (MoQuiz)  
**개념**: Google RSS 뉴스 자동 수집 → Claude AI 퀴즈 변환 → 연령/성별/지역별 랭킹 게임 플랫폼  
**스택**: Next.js 14 (App Router) + Firebase + Vercel + shadcn/ui + Anthropic Claude API  
**배포**: Vercel (자동 배포), Firebase (DB/Auth/Storage)

---

## 참조할 설계 문서 목록

개발 시작 전 반드시 아래 문서를 모두 읽고 숙지하세요:

1. `모두의퀴즈_PRD.md` — 전체 제품 요구사항, 기능 명세, 비즈니스 로직
2. `모두의퀴즈_ARCHITECTURE.md` — 기술 스택, Firestore 스키마, API 설계, Security Rules
3. `모두의퀴즈_PIPELINE.md` — RSS 수집 코드, AI 퀴즈 생성 코드, 파이프라인 로직
4. `모두의퀴즈_PROJECT_STRUCTURE.md` — 전체 폴더/파일 구조
5. `모두의퀴즈_UI_UX.md` — 컬러 시스템, 페이지별 화면 설계, 모바일 UX
6. `모두의퀴즈_ADMIN_SYSTEM.md` — 어드민 대시보드 상세 설계
7. `모두의퀴즈_GAMIFICATION.md` — 점수 계산, 랭킹, 포인트, 대회 시스템
8. `모두의퀴즈_SETUP.md` — 환경설정, 패키지 설치, Firebase 설정
9. `모두의퀴즈_TYPES.md` — TypeScript 타입 정의 전체
10. `모두의퀴즈_BUSINESS.md` — 비즈니스 모델, 스폰서십, 성장 전략

---

## 개발 지시사항

### Phase 1: 프로젝트 셋업 (먼저 실행)

```
1. Next.js 14 프로젝트 생성 (SETUP.md 참조)
2. shadcn/ui 초기화 및 필수 컴포넌트 설치
3. 모든 npm 패키지 설치
4. types/ 폴더에 TYPES.md의 타입 파일 생성
5. lib/firebase/client.ts, admin.ts 생성
6. lib/rss/sources.ts 생성 (PIPELINE.md의 RSS_SOURCES 사용)
7. lib/ai/prompts.ts, quiz-generator.ts 생성
8. lib/utils/constants.ts 생성
9. vercel.json 생성 (ARCHITECTURE.md Cron 설정)
10. firestore.rules 생성 (ARCHITECTURE.md Security Rules)
11. firestore.indexes.json 생성 (SETUP.md 인덱스)
12. .env.example 생성
```

### Phase 2: 인증 시스템

```
1. app/(auth)/login/page.tsx — 구글 로그인 페이지
   - shadcn/ui 카드 컴포넌트 사용
   - Google 로그인 버튼 (firebase/auth)
   - 로그인 후 온보딩 체크 → 리다이렉트

2. app/(auth)/onboarding/page.tsx — 프로필 설정
   - 닉네임, 성별, 연령대(10대~50대+), 지역 선택
   - 완료 시 Firestore users/{uid} 생성
   - profileCompleted: true 설정 후 dashboard 이동

3. hooks/useAuth.ts — 인증 상태 훅
   - Firebase onAuthStateChanged 구독
   - 미들웨어: middleware.ts (로그인 필요 경로 보호)
```

### Phase 3: 핵심 API Routes

```
1. app/api/cron/collect-news/route.ts
   - CRON_SECRET 인증
   - PIPELINE.md의 collectRSS() 실행
   - 전국 카테고리 10개 + 제주(고정) + 오늘 순환 지역
   - Firestore news_articles batch write

2. app/api/cron/generate-quiz/route.ts
   - CRON_SECRET 인증
   - 미생성 기사 조회 (quizGenerated: false)
   - PIPELINE.md의 generateAllAgeQuizzes() 실행
   - quiz_questions, quiz_sets Firestore 저장

3. app/api/quiz/submit/route.ts
   - Firebase Auth 토큰 검증
   - GAMIFICATION.md의 calculateTotalScore() 서버사이드 계산
   - quiz_sessions 저장
   - rankings 업데이트 (Transaction)
   - points 적립

4. app/api/quiz/daily/route.ts
   - 오늘 날짜 + 사용자 연령대 기반 퀴즈셋 조회
   - published 상태만 반환

5. app/api/news/collect/route.ts (수동 트리거)
   - Admin 검증
   - Body로 카테고리/날짜 받아서 수집 실행
```

### Phase 4: 사용자 앱 UI

```
1. app/(app)/dashboard/page.tsx
   - UI_UX.md 2.3 메인 대시보드 설계 참조
   - 데일리 퀴즈 CTA 카드
   - 카테고리 그리드 (10개)
   - 오늘의 랭킹 TOP 3
   - 포인트/스트릭 표시

2. app/(app)/quiz/daily/page.tsx
   - 오늘 데일리 퀴즈 로드
   - 이미 플레이한 경우 결과 화면으로

3. app/(app)/quiz/[setId]/page.tsx (퀴즈 플레이 핵심)
   - components/quiz/QuizCard.tsx 사용
   - 타이머 (QuizTimer.tsx)
   - 보기 선택 (QuizOptions.tsx)
   - OX 인터페이스 (QuizOX.tsx)
   - 정답/오답 애니메이션 (Framer Motion)
   - 콤보 효과 (ComboEffect.tsx)
   - Zustand quizStore로 상태 관리

4. app/(app)/quiz/result/[sessionId]/page.tsx
   - UI_UX.md 2.5 결과 화면 설계 참조
   - 점수, 정답률, 소요시간, 최고콤보
   - 카테고리 평균 비교
   - 내 순위
   - 포인트 적립 표시
   - 카카오 공유 버튼

5. app/(app)/ranking/page.tsx
   - UI_UX.md 2.6 랭킹 설계 참조
   - 일간/주간/월간/연간 탭
   - 연령대/성별/지역 필터
   - Firestore onSnapshot 실시간
   - 내 순위 고정 하단 표시
```

### Phase 5: 어드민 대시보드

```
1. app/(admin)/admin/page.tsx
   - ADMIN_SYSTEM.md 2.1 대시보드 설계 참조
   - KPI 카드 4개
   - 수집 현황 테이블
   - 빠른 액션 버튼

2. app/(admin)/admin/news/page.tsx
   - 뉴스 목록 (필터, 검색, 페이지네이션)
   - 일괄 선택 + 액션

3. app/(admin)/admin/news/collect/page.tsx
   - RSS 수동 수집 패널 (ADMIN_SYSTEM.md 3.2 참조)
   - 실시간 진행 상황 표시

4. app/(admin)/admin/quiz/generate/page.tsx
   - AI 퀴즈 자동 생성 폼 (ADMIN_SYSTEM.md 4.2 참조)
   - 카테고리, 연령대, 문제 수, 배포 예약 설정

5. app/(admin)/admin/quiz/create/page.tsx
   - 수동 문제 작성기 (ADMIN_SYSTEM.md 4.3 참조)
   - 유형: 객관식/OX/단답형/이미지/영상
   - 미리보기 기능

6. app/(admin)/admin/quiz/page.tsx
   - 퀴즈셋 목록 + 배포 상태 관리

7. app/(admin)/admin/users/page.tsx
   - 사용자 목록 + 상세

8. app/(admin)/admin/ranking/page.tsx
   - 통계 차트 (Recharts)
```

### Phase 6: 공유 및 마무리

```
1. components/common/KakaoShareButton.tsx
   - GAMIFICATION.md 5.3 참조
   - Kakao SDK 동적 로드

2. 미들웨어 (middleware.ts)
   - /admin/* → admin role 검증
   - /(app)/* → 로그인 검증
   - /quiz/*?ref= → 공유 링크 처리

3. OG 이미지 설정
   - app/api/og/route.tsx (동적 OG 이미지)

4. PWA 설정 (선택)
   - manifest.json
   - 모바일 홈화면 추가
```

---

## 핵심 개발 규칙

### 필수 준수사항
1. **서버사이드 점수 계산**: 점수는 반드시 API Route에서 계산 (클라이언트 조작 방지)
2. **Firebase Auth 토큰**: 모든 인증 필요 API는 `Authorization: Bearer <idToken>` 검증
3. **Admin API 보안**: 어드민 API는 추가로 Firestore `role === 'admin'` 확인
4. **Cron 보안**: `CRON_SECRET` 환경변수로 Cron API 보호
5. **환경변수**: Claude API Key, Firebase Admin Key는 절대 클라이언트 노출 금지

### 코드 스타일
- TypeScript strict mode
- TYPES.md의 타입 정의 반드시 사용
- 모든 Firestore 쓰기는 batch 또는 transaction 사용
- 에러 핸들링: try-catch + 적절한 HTTP 상태 코드 반환
- Loading 상태: shadcn Skeleton 컴포넌트

### UI/UX
- shadcn/ui 컴포넌트 베이스 사용
- 모바일 우선 (max-w-[480px] for 퀴즈 게임)
- UI_UX.md의 컬러 변수 CSS variables로 정의
- 퀴즈 애니메이션: Framer Motion (정답=초록, 오답=빨간 진동)
- 다크모드: shadcn 기본 지원 활용

### Firestore 패턴
```typescript
// ✅ 올바른 방법 — batch write
const batch = adminDb.batch();
for (const item of items) {
  batch.set(adminDb.doc(`collection/${item.id}`), item);
}
await batch.commit();

// ✅ 올바른 방법 — transaction (랭킹 등 동시성)
await adminDb.runTransaction(async (tx) => {
  const doc = await tx.get(ref);
  tx.update(ref, { count: doc.data().count + 1 });
});
```

---

## 예상 개발 시간

| Phase | 예상 시간 | 우선순위 |
|-------|---------|---------|
| 1. 프로젝트 셋업 | 1-2시간 | 🔴 필수 |
| 2. 인증 시스템 | 2-3시간 | 🔴 필수 |
| 3. 핵심 API | 3-4시간 | 🔴 필수 |
| 4. 사용자 UI | 4-6시간 | 🔴 필수 |
| 5. 어드민 | 4-5시간 | 🟡 중요 |
| 6. 공유/마무리 | 1-2시간 | 🟢 보완 |

**총 예상: 15-22시간 (Claude Code 기준)**

---

## 시작 명령어

```bash
# 이 순서로 실행하세요

# 1. 프로젝트 생성
npx create-next-app@latest moquiz --typescript --tailwind --eslint --app

# 2. 디렉토리 이동
cd moquiz

# 3. shadcn 초기화
npx shadcn@latest init

# 4. 이후 SETUP.md 지시에 따라 진행
```
