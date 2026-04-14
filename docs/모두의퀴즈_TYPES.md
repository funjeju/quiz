# 모두의퀴즈 — TypeScript 타입 정의 (TYPES.md)

> Claude Code가 그대로 복사해서 `types/` 폴더에 붙여넣을 수 있는 완성형 타입 파일

---

## `types/index.ts` — 전체 내보내기
```typescript
export * from './user';
export * from './news';
export * from './quiz';
export * from './ranking';
export * from './admin';
```

---

## `types/user.ts`
```typescript
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s+';
export type Gender   = 'male' | 'female' | 'other';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid:              string;
  email:            string;
  displayName:      string;
  photoURL:         string;
  nickname:         string;
  gender:           Gender | null;
  ageGroup:         AgeGroup | null;
  region:           string | null;         // e.g., 'jeju', 'seoul'
  role:             UserRole;
  totalPoints:      number;
  profileCompleted: boolean;
  createdAt:        Date;
  lastLoginAt:      Date;
  stats: UserStats;
}

export interface UserStats {
  totalQuizzes:    number;
  totalCorrect:    number;
  avgScore:        number;
  streakDays:      number;
  lastPlayDate:    string;                 // 'YYYY-MM-DD'
  badges:          string[];
}
```

---

## `types/news.ts`
```typescript
export type CategoryType =
  | 'entertainment'
  | 'current-affairs'
  | 'international'
  | 'sports'
  | 'kpop'
  | 'ai-tech'
  | 'politics'
  | 'travel'
  | 'people'
  | 'it';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  'entertainment':  '연예',
  'current-affairs':'시사',
  'international':  '국제',
  'sports':         '스포츠',
  'kpop':           'K팝',
  'ai-tech':        'AI',
  'politics':       '정치',
  'travel':         '여행',
  'people':         '인물',
  'it':             'IT',
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'entertainment':  '#EC4899',
  'current-affairs':'#3B82F6',
  'international':  '#10B981',
  'sports':         '#F97316',
  'kpop':           '#A855F7',
  'ai-tech':        '#06B6D4',
  'politics':       '#EF4444',
  'travel':         '#84CC16',
  'people':         '#F59E0B',
  'it':             '#6366F1',
};

export interface NewsArticle {
  articleId:      string;
  title:          string;
  summary:        string;
  originalUrl:    string;
  source:         string;
  imageUrl:       string | null;
  category:       CategoryType;
  region:         string | null;
  publishedAt:    Date;
  collectedAt:    Date;
  collectedDate:  string;                  // 'YYYY-MM-DD'
  quizGenerated:  boolean;
  quizSetId:      string | null;
}
```

---

## `types/quiz.ts`
```typescript
import type { AgeGroup, CategoryType } from '.';

export type QuizType       = 'multiple-choice' | 'ox' | 'short-answer' | 'image' | 'video';
export type QuizStatus     = 'draft' | 'scheduled' | 'published' | 'archived';
export type QuizDifficulty = 1 | 2 | 3;
export type SessionStatus  = 'in-progress' | 'completed' | 'abandoned';

export interface QuizQuestion {
  questionId:    string;
  setId:         string;
  newsArticleId: string;
  type:          QuizType;
  question:      string;
  options:       string[] | null;
  correctAnswer: string;
  explanation:   string;
  imageUrl:      string | null;
  videoUrl:      string | null;
  videoStart:    number | null;
  videoEnd:      number | null;
  difficulty:    QuizDifficulty;
  ageGroup:      AgeGroup | 'all';
  category:      CategoryType;
  order:         number;
  stats: {
    totalAttempts: number;
    correctCount:  number;
    accuracyRate:  number;
  };
}

export interface QuizSet {
  setId:          string;
  date:           string;                  // 'YYYY-MM-DD'
  category:       CategoryType | 'daily';
  ageGroup:       AgeGroup | 'all';
  region:         string | null;
  questionIds:    string[];
  questionCount:  number;
  status:         QuizStatus;
  publishAt:      Date;
  createdAt:      Date;
  createdBy:      'auto' | string;
  stats: {
    totalPlays:    number;
    avgScore:      number;
    avgAccuracy:   number;
  };
}

export interface QuizSetWithQuestions extends QuizSet {
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId:  string;
  userAnswer:  string;
  isCorrect:   boolean;
  timeSpent:   number;                     // ms
  score:       number;
}

export interface QuizSession {
  sessionId:      string;
  userId:         string;
  quizSetId:      string;
  category:       CategoryType | 'daily';
  date:           string;
  startedAt:      Date;
  completedAt:    Date | null;
  status:         SessionStatus;
  answers:        QuizAnswer[];
  totalScore:     number;
  totalTime:      number;                  // ms
  correctCount:   number;
  totalQuestions: number;
  combo: {
    maxCombo:     number;
    currentCombo: number;
  };
}

// 클라이언트 게임 상태 (Zustand store)
export interface QuizGameState {
  currentSet:      QuizSetWithQuestions | null;
  currentIndex:    number;
  answers:         QuizAnswer[];
  sessionId:       string | null;
  startedAt:       Date | null;
  status:          'idle' | 'playing' | 'reviewing' | 'completed';
  combo:           number;
  maxCombo:        number;
  totalScore:      number;
}
```

---

## `types/ranking.ts`
```typescript
import type { AgeGroup, Gender } from '.';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RankEntry {
  userId:       string;
  nickname:     string;
  photoURL:     string;
  score:        number;
  correctCount: number;
  totalTime:    number;
  ageGroup:     AgeGroup;
  gender:       Gender | 'other';
  region:       string;
  rank:         number;
  completedAt:  Date;
}

export interface RankingFilter {
  period:   RankingPeriod;
  ageGroup: AgeGroup | 'all';
  gender:   Gender | 'all';
  region:   string | 'all';
  category: string | 'all';
}

export interface PointTransaction {
  txId:      string;
  userId:    string;
  amount:    number;
  type:      'earn' | 'spend';
  reason:    string;
  balance:   number;
  createdAt: Date;
}
```

---

## `types/admin.ts`
```typescript
import type { CategoryType, AgeGroup } from '.';

export interface CollectionResult {
  category:      string;
  collected:     number;
  deduplicated:  number;
  saved:         number;
  errors:        string[];
}

export interface CollectionLog {
  date:          string;
  startedAt:     Date;
  completedAt:   Date;
  status:        'success' | 'partial' | 'failed';
  results:       Record<string, CollectionResult>;
  todayRegion:   string;
  totalCollected:number;
  totalQuizzes:  number;
}

export interface GenerateQuizRequest {
  date:       string;
  category:   CategoryType;
  ageGroups:  AgeGroup[];
  count:      number;           // 연령대별 문제 수
  publishAt?: string;           // ISO string, null = draft
}

export interface AdminStats {
  todayCollected:    number;
  todayQuizzes:      number;
  todayPlayers:      number;
  totalUsers:        number;
  newUsersToday:     number;
  publishedSets:     number;
  pendingSets:       number;
  avgScore:          number;
}
```
