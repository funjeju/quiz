# 모두의퀴즈 — 랭킹 & 게임화 시스템 (GAMIFICATION.md)

---

## 1. 점수 계산 시스템

### 1.1 점수 공식 (서버사이드 검증 필수)

```typescript
// lib/quiz/score-calculator.ts

const BASE_SCORE = 100;

interface ScoreParams {
  isCorrect: boolean;
  timeSpent: number;      // ms
  timeLimit: number;      // ms (기본 20,000ms)
  comboCount: number;     // 현재 연속 정답 수
}

export function calculateQuestionScore(params: ScoreParams): number {
  if (!params.isCorrect) return 0;
  
  const { timeSpent, timeLimit, comboCount } = params;
  const timeRatio = timeSpent / timeLimit;
  
  // 시간 보너스 배율
  let timeMultiplier: number;
  if (timeRatio <= 0.25)      timeMultiplier = 2.0;   // 5초 이내 (20초 기준)
  else if (timeRatio <= 0.5)  timeMultiplier = 1.5;   // 10초 이내
  else if (timeRatio <= 1.0)  timeMultiplier = 1.0;   // 시간 내
  else                         timeMultiplier = 0;     // 시간 초과

  const baseScore = Math.round(BASE_SCORE * timeMultiplier);
  
  // 콤보 보너스
  let comboBonus = 0;
  if (comboCount >= 10)      comboBonus = 300;
  else if (comboCount >= 5)  comboBonus = 100;
  else if (comboCount >= 3)  comboBonus = 50;
  
  return baseScore + comboBonus;
}

export function calculateTotalScore(
  answers: { score: number; isCorrect: boolean }[],
  totalQuestions: number
): { totalScore: number; perfectBonus: number; finalScore: number } {
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const correctCount = answers.filter(a => a.isCorrect).length;
  
  // 만점 보너스: 모두 맞춘 경우
  const perfectBonus = correctCount === totalQuestions ? 500 : 0;
  
  return {
    totalScore,
    perfectBonus,
    finalScore: totalScore + perfectBonus,
  };
}
```

### 1.2 점수 예시 (20문제 기준)
```
최대 이론 점수:
  - 기본 만점: 20문제 × 200점 (5초 이내 × 2.0배) = 4,000점
  - 10콤보 보너스: 2회 × 300점 = 600점
  - 만점 보너스: 500점
  = 최대 5,100점

일반 좋은 점수 (15초, 5콤보 x2):
  - 20 × 150점 = 3,000점
  - 콤보 200점
  = 3,200점
```

---

## 2. 랭킹 시스템

### 2.1 랭킹 구조

```typescript
// Firestore 경로 설계
// rankings/{period}/{date}/leaderboard/{userId}

type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 랭킹 엔트리
interface RankEntry {
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

### 2.2 랭킹 집계 로직

```typescript
// lib/quiz/ranking-service.ts

// 동점자 처리: 점수 동일 → 시간 빠른 순
export function compareRankEntries(a: RankEntry, b: RankEntry): number {
  if (b.score !== a.score) return b.score - a.score;    // 점수 높은 순
  return a.totalTime - b.totalTime;                      // 시간 빠른 순
}

// 점수 제출 시 랭킹 업데이트 (Firestore Transaction)
export async function submitAndUpdateRanking(
  db: Firestore,
  session: QuizSession,
  user: User
): Promise<{ rank: number; pointsEarned: number }> {
  
  const today = getTodayStr();
  const rankRef = db.doc(`rankings/daily/${today}/leaderboard/${user.uid}`);
  
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(rankRef);
    
    // 더 높은 점수만 반영
    if (existing.exists && existing.data()!.score >= session.totalScore) {
      return;
    }
    
    tx.set(rankRef, {
      userId: user.uid,
      nickname: user.nickname,
      photoURL: user.photoURL,
      score: session.totalScore,
      correctCount: session.correctCount,
      totalTime: session.totalTime,
      ageGroup: user.ageGroup,
      gender: user.gender,
      region: user.region,
      completedAt: serverTimestamp(),
    });
  });
  
  // 포인트 적립
  const pointsEarned = await awardPoints(db, user.uid, session);
  
  // 내 순위 계산 (근사치 — 정확한 순위는 집계 Job에서)
  const rank = await estimateRank(db, today, session.totalScore);
  
  return { rank, pointsEarned };
}
```

### 2.3 랭킹 필터 구현

```typescript
// 연령대별 필터
async function getRankingByAgeGroup(
  date: string,
  ageGroup: AgeGroup,
  limit: number = 100
): Promise<RankEntry[]> {
  return db
    .collection(`rankings/daily/${date}/leaderboard`)
    .where('ageGroup', '==', ageGroup)
    .orderBy('score', 'desc')
    .orderBy('totalTime', 'asc')
    .limit(limit)
    .get();
}

// 지역별 필터
async function getRankingByRegion(
  date: string,
  region: string,
  limit: number = 100
): Promise<RankEntry[]> {
  return db
    .collection(`rankings/daily/${date}/leaderboard`)
    .where('region', '==', region)
    .orderBy('score', 'desc')
    .limit(limit)
    .get();
}
```

---

## 3. 포인트 시스템

### 3.1 포인트 적립 규칙

```typescript
// lib/quiz/points-service.ts

export const POINT_RULES = {
  DAILY_QUIZ_PARTICIPATE: 10,         // 데일리 퀴즈 참여
  DAILY_QUIZ_PERFECT: 50,             // 데일리 퀴즈 만점
  CATEGORY_QUIZ_COMPLETE: 20,         // 카테고리 퀴즈 완료
  CATEGORY_QUIZ_RANK1: 200,           // 카테고리 1위
  CATEGORY_QUIZ_TOP3: 100,            // 카테고리 TOP 3
  CATEGORY_QUIZ_TOP10: 50,            // 카테고리 TOP 10
  INVITE_FRIEND: 30,                  // 친구 초대 (카카오 공유 통해 가입)
  STREAK_7DAYS: 100,                  // 7일 연속 출석
  STREAK_30DAYS: 500,                 // 30일 연속 출석
  WEEKLY_CHAMPION: 1000,              // 주간 챔피언
  MONTHLY_CHAMPION: 5000,             // 월간 챔피언
} as const;

export async function awardPoints(
  db: Firestore,
  userId: string,
  session: QuizSession,
  rank?: number
): Promise<number> {
  let earned = 0;
  const reasons: string[] = [];
  
  if (session.category === 'daily') {
    earned += POINT_RULES.DAILY_QUIZ_PARTICIPATE;
    reasons.push('daily_participate');
    
    if (session.correctCount === session.totalQuestions) {
      earned += POINT_RULES.DAILY_QUIZ_PERFECT;
      reasons.push('daily_perfect');
    }
  } else {
    earned += POINT_RULES.CATEGORY_QUIZ_COMPLETE;
    reasons.push('category_complete');
    
    if (rank === 1) { earned += POINT_RULES.CATEGORY_QUIZ_RANK1; reasons.push('rank1'); }
    else if (rank && rank <= 3) { earned += POINT_RULES.CATEGORY_QUIZ_TOP3; reasons.push('top3'); }
    else if (rank && rank <= 10) { earned += POINT_RULES.CATEGORY_QUIZ_TOP10; reasons.push('top10'); }
  }
  
  // 포인트 트랜잭션 기록
  const batch = db.batch();
  const txRef = db.collection(`points/${userId}/transactions`).doc();
  const userRef = db.doc(`users/${userId}`);
  
  batch.set(txRef, {
    amount: earned,
    type: 'earn',
    reasons,
    createdAt: serverTimestamp(),
  });
  
  batch.update(userRef, {
    totalPoints: FieldValue.increment(earned),
  });
  
  await batch.commit();
  return earned;
}
```

---

## 4. 뱃지 & 업적 시스템

### 4.1 뱃지 종류
```typescript
export const BADGES = {
  // 랭킹 뱃지
  DAILY_GOLD:     { id: 'daily_gold',   name: '일간 금왕관', emoji: '👑', condition: 'daily_rank_1' },
  DAILY_SILVER:   { id: 'daily_silver', name: '일간 은왕관', emoji: '🥈', condition: 'daily_rank_2' },
  DAILY_BRONZE:   { id: 'daily_bronze', name: '일간 동왕관', emoji: '🥉', condition: 'daily_rank_3' },
  DAILY_ELITE:    { id: 'daily_elite',  name: '엘리트',      emoji: '⭐', condition: 'daily_rank_10' },
  
  // 출석 뱃지
  STREAK_7:       { id: 'streak_7',    name: '7일 연속왕',   emoji: '🔥', condition: 'streak_7' },
  STREAK_30:      { id: 'streak_30',   name: '30일 마니아',  emoji: '💎', condition: 'streak_30' },
  STREAK_100:     { id: 'streak_100',  name: '100일 전설',   emoji: '🏆', condition: 'streak_100' },
  
  // 점수 뱃지
  PERFECT_SCORE:  { id: 'perfect',     name: '만점왕',       emoji: '💯', condition: 'perfect_score' },
  SPEED_KING:     { id: 'speed',       name: '스피드킹',     emoji: '⚡', condition: 'avg_time_under5s' },
  
  // 카테고리 뱃지
  KPOP_MASTER:    { id: 'kpop_master', name: 'K팝 마스터',   emoji: '🎤', condition: 'kpop_top1_5times' },
  AI_GENIUS:      { id: 'ai_genius',   name: 'AI 지니어스',  emoji: '🤖', condition: 'ai_top1_5times' },
  // ... 카테고리별
} as const;
```

---

## 5. 대회 시스템

### 5.1 대회 종류 및 일정
| 대회 | 주기 | 기간 | 문제 수 | 참여 조건 |
|------|------|------|---------|---------|
| 데일리 퀴즈 | 매일 | 당일 | 10문제 | 없음 |
| 위클리 챌린지 | 주간 | 월~일 | 30문제 | 없음 |
| 먼슬리 왕중왕 | 월간 | 마지막 주말 | 50문제 | 주간 TOP 100 |
| 이얼리 챔피언십 | 연간 | 12월 마지막 주 | 100문제 | 월간 TOP 50 |

### 5.2 위클리 퀴즈 설계
```typescript
// 주간 퀴즈: 월~일 기간의 모든 데일리 퀴즈 누적 점수
interface WeeklyRanking {
  weekId: string;           // 'YYYY-WW'
  userId: string;
  dailyScores: {
    date: string;
    score: number;
  }[];
  totalScore: number;
  participationDays: number;   // 참여한 날 수 (보너스 배수 결정)
  bonusMultiplier: number;     // 7일 참여 시 ×1.2
  finalScore: number;
}
```

### 5.3 카카오 공유 연동

```typescript
// components/common/KakaoShareButton.tsx

interface KakaoShareData {
  title: string;
  description: string;
  imageUrl: string;
  quizSetId: string;
  userId: string;
  score: number;
  rank: number;
}

export function shareToKakao(data: KakaoShareData) {
  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `🧠 모두의퀴즈 — ${data.score.toLocaleString()}점 달성!`,
      description: `전체 ${data.rank}위 달성! 나보다 잘 풀 수 있어? 🏆`,
      imageUrl: data.imageUrl || 'https://moquiz.kr/og-image.png',
      link: {
        mobileWebUrl: `https://moquiz.kr/quiz/${data.quizSetId}?ref=${data.userId}`,
        webUrl: `https://moquiz.kr/quiz/${data.quizSetId}?ref=${data.userId}`,
      },
    },
    buttons: [
      {
        title: '퀴즈 풀기',
        link: {
          mobileWebUrl: `https://moquiz.kr/quiz/${data.quizSetId}?ref=${data.userId}`,
          webUrl: `https://moquiz.kr/quiz/${data.quizSetId}?ref=${data.userId}`,
        },
      },
    ],
  });
}
```

---

## 6. 알림 시스템 (향후)

### 6.1 알림 종류
| 알림 | 시점 | 채널 |
|------|------|------|
| 데일리 퀴즈 배포 | 09:00 KST | 푸시 알림 |
| 랭킹 변동 (Top 10 진입) | 실시간 | 인앱 알림 |
| 대회 시작 | 1일 전, 당일 | 푸시 알림 |
| 포인트 적립 | 퀴즈 완료 후 | 인앱 알림 |
| 친구 퀴즈 공유 수신 | 즉시 | 카카오 메시지 |
| 연속 출석 위기 | 23:00 KST | 푸시 알림 |

### 6.2 구현 계획
- Phase 1: 인앱 알림 (Firestore notifications 컬렉션)
- Phase 2: 웹 푸시 (Firebase Cloud Messaging)
- Phase 3: 카카오 알림톡
