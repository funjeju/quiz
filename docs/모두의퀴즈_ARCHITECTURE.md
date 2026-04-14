# 모두의퀴즈 — 기술 아키텍처 (ARCHITECTURE.md)

> **스택**: Next.js 14 · Firebase · Vercel · shadcn/ui · Claude API (Anthropic)

---

## 1. 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   Next.js 14 App Router (Vercel Edge)                       │
│   ├── 사용자 앱 (/)                                          │
│   └── 어드민 대시보드 (/admin)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────────────┐
│                       API LAYER                             │
│   Next.js API Routes (/app/api/*)                           │
│   ├── /api/news/collect        RSS 수집 트리거               │
│   ├── /api/quiz/generate       AI 퀴즈 생성                  │
│   ├── /api/quiz/[id]           퀴즈 조회                     │
│   ├── /api/ranking             랭킹 조회/갱신                 │
│   ├── /api/user/profile        프로필 관리                   │
│   └── /api/admin/*            어드민 전용 API                │
└──────┬──────────────────┬──────────────────────────────────┘
       │                  │
┌──────▼──────┐    ┌──────▼──────────────────────────────────┐
│  Firebase   │    │            EXTERNAL SERVICES            │
│  ├── Auth   │    │  ├── Google RSS Feeds                   │
│  ├── Firestore│  │  ├── Anthropic Claude API               │
│  └── Storage│    │  └── Kakao SDK (공유)                   │
└─────────────┘    └─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CRON JOBS (Vercel)                       │
│   매일 06:00 KST → /api/news/collect → /api/quiz/generate   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택 상세

### 2.1 프론트엔드
```
Next.js 14 (App Router)
  - Server Components (기본)
  - Client Components (퀴즈 게임, 실시간 랭킹)
  - Server Actions (폼, 점수 제출)

UI:
  - shadcn/ui (컴포넌트 베이스)
  - Tailwind CSS (스타일링)
  - Framer Motion (퀴즈 애니메이션)
  - Lucide React (아이콘)

상태관리:
  - Zustand (클라이언트 게임 상태)
  - TanStack Query (서버 상태/캐싱)

실시간:
  - Firebase Firestore onSnapshot (랭킹 실시간 구독)
```

### 2.2 백엔드 / API
```
Next.js API Routes (Edge Runtime 권장)
  - rss-parser: RSS XML 파싱
  - node-fetch: RSS 수집
  - firebase-admin: Firestore 서버사이드 접근
  - @anthropic-ai/sdk: Claude API 연동
```

### 2.3 데이터베이스 (Firebase)
```
Firebase Services:
  - Authentication: Google OAuth
  - Firestore: 주 데이터 저장소
  - Storage: 이미지/미디어 파일
  - Functions (선택): 백그라운드 작업 (Vercel Cron으로 대체 가능)
```

### 2.4 배포 (Vercel)
```
Vercel:
  - 자동 배포: GitHub main 브랜치 push
  - Preview 배포: PR마다 자동
  - Cron Jobs: vercel.json 설정
  - Edge Config: 피처 플래그
  - 환경변수: 모든 시크릿 관리
```

---

## 3. Firestore 데이터 모델

### 3.1 컬렉션 구조 개요
```
Firestore
├── users/                      사용자 프로필
├── news_articles/              수집된 뉴스 기사
├── quiz_sets/                  퀴즈 세트 (카테고리/날짜 단위)
├── quiz_questions/             개별 퀴즈 문제
├── quiz_sessions/              사용자 퀴즈 플레이 세션
├── rankings/                   랭킹 집계
│   ├── daily/
│   ├── weekly/
│   ├── monthly/
│   └── yearly/
├── points/                     포인트 원장
├── admin_logs/                 어드민 작업 로그
└── system_config/              시스템 설정
```

### 3.2 스키마 상세

#### users/{uid}
```typescript
{
  uid: string;                  // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string;
  nickname: string;             // 앱 내 닉네임
  gender: 'male' | 'female' | 'other' | null;
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s+';
  region: string;               // 시도 코드 (e.g., 'jeju', 'seoul')
  role: 'user' | 'admin';
  totalPoints: number;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  profileCompleted: boolean;
  stats: {
    totalQuizzes: number;
    totalCorrect: number;
    avgScore: number;
    streakDays: number;
    lastPlayDate: string;       // 'YYYY-MM-DD'
  };
}
```

#### news_articles/{articleId}
```typescript
{
  articleId: string;            // URL 해시
  title: string;
  summary: string;              // AI 생성 200자 요약
  originalUrl: string;
  source: string;               // 언론사명
  imageUrl: string | null;
  category: CategoryType;       // 'entertainment' | 'current-affairs' | ...
  region: string | null;        // 지역 기사인 경우
  publishedAt: Timestamp;
  collectedAt: Timestamp;
  collectedDate: string;        // 'YYYY-MM-DD' (인덱싱용)
  quizGenerated: boolean;
  quizSetId: string | null;
}
```

#### quiz_sets/{setId}
```typescript
{
  setId: string;                // 'YYYY-MM-DD_category_ageGroup'
  date: string;                 // 'YYYY-MM-DD'
  category: CategoryType | 'daily';
  ageGroup: AgeGroup | 'all';
  region: string | null;
  questionIds: string[];        // quiz_questions 참조
  questionCount: number;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishAt: Timestamp;
  createdAt: Timestamp;
  createdBy: 'auto' | string;   // auto or admin uid
  stats: {
    totalPlays: number;
    avgScore: number;
    avgAccuracy: number;
  };
}
```

#### quiz_questions/{questionId}
```typescript
{
  questionId: string;
  setId: string;
  newsArticleId: string;
  type: 'multiple-choice' | 'ox' | 'short-answer' | 'image' | 'video';
  question: string;
  options: string[] | null;     // 객관식 4개 보기
  correctAnswer: string;
  explanation: string;          // 정답 해설
  imageUrl: string | null;
  videoUrl: string | null;
  difficulty: 1 | 2 | 3;       // 1=쉬움, 2=보통, 3=어려움
  ageGroup: AgeGroup | 'all';
  category: CategoryType;
  order: number;
  stats: {
    totalAttempts: number;
    correctCount: number;
    accuracyRate: number;
  };
}
```

#### quiz_sessions/{sessionId}
```typescript
{
  sessionId: string;
  userId: string;
  quizSetId: string;
  category: CategoryType | 'daily';
  date: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  status: 'in-progress' | 'completed' | 'abandoned';
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;          // ms
    score: number;
  }[];
  totalScore: number;
  totalTime: number;            // ms
  correctCount: number;
  combo: {
    maxCombo: number;
    currentCombo: number;
  };
}
```

#### rankings/daily/{date}/scores/{userId}
```typescript
{
  userId: string;
  nickname: string;
  photoURL: string;
  score: number;
  correctCount: number;
  totalTime: number;
  ageGroup: AgeGroup;
  gender: string;
  region: string;
  rank: number;
  completedAt: Timestamp;
}
```

#### points/{userId}/transactions/{txId}
```typescript
{
  txId: string;
  userId: string;
  amount: number;               // + 적립, - 사용
  type: 'earn' | 'spend';
  reason: string;               // 'daily_quiz' | 'perfect_score' | 'invite' | ...
  balance: number;              // 거래 후 잔액
  createdAt: Timestamp;
}
```

---

## 4. API 라우트 설계

### 4.1 뉴스 수집 API
```
POST /api/news/collect
  Body: { categories?: string[], date?: string, force?: boolean }
  Auth: Admin only (Service Account)
  Action:
    1. 카테고리별 RSS URL 조합
    2. rss-parser로 XML 파싱
    3. 전날 기사 필터링
    4. Firestore batch write (news_articles)
    5. 수집 결과 반환
  Response: { collected: number, byCategory: Record<string, number> }
```

### 4.2 퀴즈 생성 API
```
POST /api/quiz/generate
  Body: { category: string, date: string, ageGroups?: AgeGroup[] }
  Auth: Admin only
  Action:
    1. news_articles에서 대상 기사 쿼리
    2. Claude API → 기사별 요약 생성
    3. Claude API → 연령대별 퀴즈 생성
    4. quiz_questions batch write
    5. quiz_sets 생성
  Response: { generated: number, setIds: string[] }
```

### 4.3 퀴즈 조회 API
```
GET /api/quiz/daily?date=YYYY-MM-DD&ageGroup=20s
  Auth: Firebase Auth token
  Response: QuizSet with questions

GET /api/quiz/category?category=kpop&date=YYYY-MM-DD&ageGroup=20s
  Auth: Firebase Auth token
  Response: QuizSet with questions

GET /api/quiz/[setId]
  Auth: Firebase Auth token
  Response: QuizSet with questions
```

### 4.4 점수 제출 API
```
POST /api/quiz/submit
  Body: { sessionId, quizSetId, answers[], totalScore, totalTime }
  Auth: Firebase Auth token
  Action:
    1. 세션 유효성 검증
    2. 점수 계산 (서버사이드)
    3. quiz_sessions 업데이트
    4. rankings 업데이트 (transaction)
    5. points 적립
  Response: { score, rank, pointsEarned }
```

### 4.5 랭킹 API
```
GET /api/ranking?type=daily&date=YYYY-MM-DD&filter=ageGroup&value=20s
  Auth: Firebase Auth token
  Response: { rankings: RankingEntry[], myRank: number }
```

---

## 5. Claude API 통합

### 5.1 요약 프롬프트
```typescript
const SUMMARY_PROMPT = `
다음 뉴스 기사를 퀴즈 생성에 적합한 핵심 정보 위주로 200자 이내로 요약해주세요.
요약에는 반드시 포함: 주요 인물/기관, 핵심 사건, 날짜, 수치 정보.

기사 제목: {title}
기사 내용: {content}

요약:
`;
```

### 5.2 퀴즈 생성 프롬프트
```typescript
const QUIZ_PROMPT = `
다음 뉴스 요약을 바탕으로 {ageGroup} 대상의 퀴즈를 {count}개 생성해주세요.

연령대 특성:
{ageGroupDescription}

뉴스 요약: {summary}
카테고리: {category}

출력 형식 (JSON):
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "문제 내용",
      "options": ["①보기1", "②보기2", "③보기3", "④보기4"],
      "correctAnswer": "①보기1",
      "explanation": "정답 해설 (50자 이내)",
      "difficulty": 1
    }
  ]
}

규칙:
- 문제는 반드시 뉴스 내용에서만 출제
- 오답도 그럴듯하게 구성 (함정 제외)
- 해설은 학습 가치 있게 작성
- JSON 형식만 출력, 다른 텍스트 없음
`;
```

### 5.3 API 호출 제한 및 비용 관리
```
Rate Limit 전략:
- 카테고리당 25기사 × 5연령대 = 125 API 호출/카테고리
- 전체 카테고리(10개) = 최대 1,250 호출/일
- Batch 처리: 5초 간격으로 throttle
- 비용 추정: ~$2-5/일 (claude-sonnet 기준)

캐싱 전략:
- 동일 기사 재생성 방지: news_articles.quizGenerated 플래그
- 생성된 퀴즈 Firestore 영구 저장
```

---

## 6. Vercel Cron 설정

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/collect-news",
      "schedule": "0 21 * * *"
    },
    {
      "path": "/api/cron/generate-quiz",
      "schedule": "0 22 * * *"
    },
    {
      "path": "/api/cron/update-rankings",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/reset-daily",
      "schedule": "0 15 * * *"
    }
  ]
}
```

> UTC 기준: 21:00 UTC = KST 06:00

---

## 7. Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 사용자 본인 데이터만 읽기/쓰기
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // 뉴스 기사: 로그인 사용자 읽기, Admin만 쓰기
    match /news_articles/{articleId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // 퀴즈: published 상태만 일반 사용자 읽기
    match /quiz_sets/{setId} {
      allow read: if request.auth != null && 
                     (resource.data.status == 'published' || isAdmin());
      allow write: if isAdmin();
    }
    
    match /quiz_questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // 세션: 본인만
    match /quiz_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // 랭킹: 읽기 공개, 쓰기 서버만
    match /rankings/{document=**} {
      allow read: if true;
      allow write: if false; // API Route (Service Account)만
    }
    
    // 포인트: 본인만 읽기, 쓰기 서버만
    match /points/{userId}/{document=**} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // API Route만
    }
    
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 8. 환경변수 목록

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (서버사이드)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Anthropic Claude
ANTHROPIC_API_KEY=

# Kakao (향후)
NEXT_PUBLIC_KAKAO_APP_KEY=

# Vercel Cron 보안
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://moquiz.kr
NEXT_PUBLIC_APP_NAME=모두의퀴즈
```
