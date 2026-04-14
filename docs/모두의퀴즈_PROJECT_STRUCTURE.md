# 모두의퀴즈 — 프로젝트 구조 (PROJECT_STRUCTURE.md)

---

## 디렉토리 트리

```
moquiz/
├── .env.local                          # 환경변수 (gitignore)
├── .env.example                        # 환경변수 샘플
├── vercel.json                         # Vercel 배포 설정 (Cron 포함)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # 루트 레이아웃
│   ├── page.tsx                        # 메인 (랜딩/대시보드)
│   ├── globals.css
│   │
│   ├── (auth)/                         # 인증 라우트 그룹
│   │   ├── login/page.tsx              # 구글 로그인
│   │   └── onboarding/page.tsx         # 최초 프로필 설정
│   │
│   ├── (app)/                          # 앱 메인 라우트 그룹 (로그인 필요)
│   │   ├── layout.tsx                  # 앱 레이아웃 (네비게이션)
│   │   ├── dashboard/page.tsx          # 메인 대시보드
│   │   ├── quiz/
│   │   │   ├── daily/page.tsx          # 데일리 퀴즈
│   │   │   ├── [setId]/page.tsx        # 특정 퀴즈셋 플레이
│   │   │   ├── category/
│   │   │   │   └── [category]/page.tsx # 카테고리 퀴즈
│   │   │   └── result/[sessionId]/page.tsx  # 퀴즈 결과
│   │   ├── ranking/
│   │   │   ├── page.tsx                # 전체 랭킹
│   │   │   └── [category]/page.tsx     # 카테고리별 랭킹
│   │   ├── profile/
│   │   │   ├── page.tsx                # 내 프로필
│   │   │   └── edit/page.tsx           # 프로필 수정
│   │   └── news/
│   │       ├── page.tsx                # 뉴스 목록
│   │       └── [articleId]/page.tsx    # 뉴스 상세
│   │
│   ├── (admin)/                        # 어드민 라우트 그룹
│   │   ├── layout.tsx                  # 어드민 레이아웃 (사이드바)
│   │   ├── admin/page.tsx              # 어드민 대시보드
│   │   ├── admin/news/
│   │   │   ├── page.tsx                # 뉴스 목록 관리
│   │   │   ├── collect/page.tsx        # RSS 수동 수집
│   │   │   └── [articleId]/page.tsx    # 뉴스 상세/편집
│   │   ├── admin/quiz/
│   │   │   ├── page.tsx                # 퀴즈 목록 관리
│   │   │   ├── generate/page.tsx       # AI 자동 생성
│   │   │   ├── create/page.tsx         # 수동 문제 생성
│   │   │   ├── [setId]/page.tsx        # 퀴즈셋 편집
│   │   │   └── schedule/page.tsx       # 배포 스케줄 관리
│   │   ├── admin/users/
│   │   │   ├── page.tsx                # 사용자 목록
│   │   │   └── [uid]/page.tsx          # 사용자 상세
│   │   ├── admin/ranking/page.tsx      # 랭킹/통계
│   │   └── admin/settings/page.tsx     # 시스템 설정
│   │
│   └── api/                            # API Routes
│       ├── auth/
│       │   └── [...nextauth]/route.ts  # (필요시)
│       ├── cron/
│       │   ├── collect-news/route.ts   # Cron: RSS 수집
│       │   ├── generate-quiz/route.ts  # Cron: 퀴즈 생성
│       │   ├── publish-quiz/route.ts   # Cron: 퀴즈 배포
│       │   └── update-rankings/route.ts
│       ├── news/
│       │   ├── collect/route.ts        # 수동 수집 트리거
│       │   └── [articleId]/route.ts
│       ├── quiz/
│       │   ├── generate/route.ts       # AI 퀴즈 생성
│       │   ├── daily/route.ts
│       │   ├── category/route.ts
│       │   ├── [setId]/route.ts
│       │   ├── submit/route.ts         # 점수 제출
│       │   └── session/route.ts        # 세션 관리
│       ├── ranking/
│       │   └── route.ts
│       ├── user/
│       │   └── profile/route.ts
│       └── admin/
│           ├── news/route.ts
│           ├── quiz/route.ts
│           └── users/route.ts
│
├── components/                         # 공유 컴포넌트
│   ├── ui/                             # shadcn/ui 기본 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   └── ... (shadcn 컴포넌트들)
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx               # 모바일 하단 네비
│   │   ├── AdminSidebar.tsx
│   │   └── PageWrapper.tsx
│   │
│   ├── quiz/
│   │   ├── QuizCard.tsx                # 문제 카드
│   │   ├── QuizTimer.tsx               # 타이머
│   │   ├── QuizOptions.tsx             # 보기 선택지
│   │   ├── QuizOX.tsx                  # OX 문제
│   │   ├── QuizProgress.tsx            # 진행 바
│   │   ├── QuizResult.tsx              # 결과 화면
│   │   ├── QuizExplanation.tsx         # 해설
│   │   ├── ComboEffect.tsx             # 콤보 애니메이션
│   │   └── ScoreBoard.tsx              # 점수 표시
│   │
│   ├── ranking/
│   │   ├── RankingTable.tsx
│   │   ├── RankingFilter.tsx           # 연령/성별/지역 필터
│   │   ├── MyRankBadge.tsx
│   │   └── LeaderboardRow.tsx
│   │
│   ├── news/
│   │   ├── NewsCard.tsx
│   │   ├── NewsList.tsx
│   │   └── CategoryBadge.tsx
│   │
│   ├── admin/
│   │   ├── NewsTable.tsx
│   │   ├── QuizTable.tsx
│   │   ├── UserTable.tsx
│   │   ├── StatsCard.tsx
│   │   ├── QuizEditor.tsx              # 수동 문제 편집기
│   │   ├── QuizGenerateForm.tsx        # AI 생성 폼
│   │   └── RSSCollectPanel.tsx         # RSS 수집 패널
│   │
│   └── common/
│       ├── KakaoShareButton.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── PointBadge.tsx
│       ├── AgeGroupBadge.tsx
│       └── RegionBadge.tsx
│
├── lib/                                # 핵심 라이브러리
│   ├── firebase/
│   │   ├── client.ts                   # Firebase 클라이언트 초기화
│   │   ├── admin.ts                    # Firebase Admin 초기화
│   │   ├── auth.ts                     # Auth 헬퍼
│   │   ├── firestore.ts                # Firestore 헬퍼
│   │   └── storage.ts                  # Storage 헬퍼
│   │
│   ├── rss/
│   │   ├── sources.ts                  # RSS URL 목록
│   │   ├── collector.ts                # RSS 수집기
│   │   └── scheduler.ts                # 순환 지역 스케줄러
│   │
│   ├── ai/
│   │   ├── client.ts                   # Anthropic 클라이언트
│   │   ├── prompts.ts                  # 프롬프트 템플릿
│   │   ├── quiz-generator.ts           # 퀴즈 생성 서비스
│   │   └── summarizer.ts               # 기사 요약 서비스
│   │
│   ├── quiz/
│   │   ├── quiz-set-builder.ts         # 퀴즈셋 구성 로직
│   │   ├── score-calculator.ts         # 점수 계산
│   │   └── ranking-service.ts          # 랭킹 집계
│   │
│   └── utils/
│       ├── date.ts                     # 날짜 유틸
│       ├── hash.ts                     # 해시 유틸
│       └── constants.ts                # 상수 정의
│
├── hooks/                              # Custom Hooks
│   ├── useAuth.ts                      # 인증 상태
│   ├── useQuiz.ts                      # 퀴즈 게임 상태
│   ├── useRanking.ts                   # 랭킹 실시간 구독
│   ├── useTimer.ts                     # 퀴즈 타이머
│   ├── usePoints.ts                    # 포인트 조회
│   └── useProfile.ts                   # 사용자 프로필
│
├── stores/                             # Zustand 상태
│   ├── quizStore.ts                    # 퀴즈 게임 상태
│   └── authStore.ts                    # 인증 상태
│
├── types/                              # TypeScript 타입
│   ├── index.ts                        # 타입 내보내기
│   ├── quiz.ts                         # 퀴즈 관련 타입
│   ├── news.ts                         # 뉴스 관련 타입
│   ├── user.ts                         # 사용자 타입
│   └── ranking.ts                      # 랭킹 타입
│
└── public/
    ├── icons/
    │   └── categories/                 # 카테고리 아이콘
    └── images/
```

---

## 주요 파일별 역할 요약

| 파일 | 역할 |
|------|------|
| `app/api/cron/collect-news/route.ts` | Vercel Cron 진입점 — RSS 수집 실행 |
| `app/api/cron/generate-quiz/route.ts` | Vercel Cron 진입점 — AI 퀴즈 생성 |
| `lib/rss/collector.ts` | Google RSS XML 파싱 및 Firestore 저장 |
| `lib/ai/quiz-generator.ts` | Claude API 호출 및 퀴즈 파싱 |
| `lib/quiz/score-calculator.ts` | 속도+정확도 점수 계산 |
| `lib/quiz/ranking-service.ts` | Firestore 랭킹 집계 (transaction) |
| `components/quiz/QuizCard.tsx` | 핵심 퀴즈 UI 컴포넌트 |
| `stores/quizStore.ts` | 퀴즈 게임 중 클라이언트 상태 관리 |
| `app/(admin)/admin/quiz/create/page.tsx` | 관리자 수동 문제 작성 페이지 |
