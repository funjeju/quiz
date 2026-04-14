# 모두의퀴즈 — 뉴스 수집 & AI 퀴즈 생성 파이프라인 (PIPELINE.md)

---

## 1. 전체 파이프라인 흐름

```
[06:00 KST] Vercel Cron 트리거
      │
      ▼
[STEP 1] Google RSS 수집
      │  - 전국 카테고리 10개
      │  - 제주 고정 + 오늘의 순환 지역 1개
      │  - 카테고리당 최소 25개 기사 수집
      │  - Firestore news_articles 저장
      │
      ▼
[STEP 2] 기사 필터링 & 정제
      │  - 전날 날짜 기사만
      │  - 중복 URL 제거
      │  - 내용 길이 필터 (100자 미만 제외)
      │
      ▼
[STEP 3] Claude API — 기사 요약
      │  - 기사당 200자 핵심 요약 생성
      │  - 인물/수치/날짜 반드시 포함
      │  - 배치 처리 (5초 간격 throttle)
      │
      ▼
[STEP 4] Claude API — 연령대별 퀴즈 생성
      │  - 요약 1개 → 연령대 5세트 (10대~50대+)
      │  - 세트당 4문제 (최소)
      │  - 카테고리당 25기사 × 4문제 = 100문제
      │  - 최종 퀴즈셋 구성: 20문제 선별
      │
      ▼
[STEP 5] 퀴즈셋 구성 & DB 저장
      │  - quiz_questions 개별 저장
      │  - quiz_sets 묶음 생성
      │  - 배포 상태: 'scheduled' (당일 09:00 자동 published)
      │
      ▼
[09:00 KST] 퀴즈 자동 배포 (Cron)
      │  - status: scheduled → published
      │  - 푸시 알림 발송 (향후)
      │
      ▼
[사용자 플레이] → [점수 제출] → [랭킹 갱신]
```

---

## 2. Google RSS 수집 상세

### 2.1 RSS URL 전체 목록

```typescript
// lib/rss/sources.ts

export const RSS_SOURCES = {
  // === 전국 카테고리 ===
  entertainment: {
    name: '연예',
    urls: [
      'https://news.google.com/rss/search?q=연예+뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=드라마+영화+연예인&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  'current-affairs': {
    name: '시사',
    urls: [
      'https://news.google.com/rss/search?q=시사+한국뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=사회이슈+오늘뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  international: {
    name: '국제',
    urls: [
      'https://news.google.com/rss/search?q=국제뉴스+해외&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=미국+중국+일본+뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  sports: {
    name: '스포츠',
    urls: [
      'https://news.google.com/rss/search?q=스포츠+야구+축구&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=손흥민+류현진+스포츠선수&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  kpop: {
    name: 'K팝',
    urls: [
      'https://news.google.com/rss/search?q=kpop+케이팝+아이돌&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=BTS+블랙핑크+뉴진스+aespa&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  'ai-tech': {
    name: 'AI',
    urls: [
      'https://news.google.com/rss/search?q=인공지능+AI+ChatGPT&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=AI기술+딥러닝+머신러닝&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  politics: {
    name: '정치',
    urls: [
      'https://news.google.com/rss/search?q=정치+국회+대통령&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=여당+야당+정치뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  travel: {
    name: '여행',
    urls: [
      'https://news.google.com/rss/search?q=여행+관광+여행지&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=해외여행+국내여행+관광지&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  people: {
    name: '인물',
    urls: [
      'https://news.google.com/rss/search?q=화제인물+인물뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=유명인+인터뷰+CEO+인물&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  it: {
    name: 'IT',
    urls: [
      'https://news.google.com/rss/search?q=IT기술+테크뉴스+스마트폰&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=삼성+애플+구글+IT기업&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
};

// === 지역 RSS ===
export const REGION_RSS_SOURCES = {
  jeju: {       // 고정 (매일)
    name: '제주',
    url: 'https://news.google.com/rss/search?q=제주+제주도뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  seoul: {
    name: '서울',
    url: 'https://news.google.com/rss/search?q=서울+서울뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  busan: {
    name: '부산',
    url: 'https://news.google.com/rss/search?q=부산+부산뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  daegu: { name: '대구', url: 'https://news.google.com/rss/search?q=대구뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  incheon: { name: '인천', url: 'https://news.google.com/rss/search?q=인천뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gwangju: { name: '광주', url: 'https://news.google.com/rss/search?q=광주뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  daejeon: { name: '대전', url: 'https://news.google.com/rss/search?q=대전뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  ulsan: { name: '울산', url: 'https://news.google.com/rss/search?q=울산뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  sejong: { name: '세종', url: 'https://news.google.com/rss/search?q=세종뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeonggi: { name: '경기', url: 'https://news.google.com/rss/search?q=경기도뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gangwon: { name: '강원', url: 'https://news.google.com/rss/search?q=강원뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  chungbuk: { name: '충북', url: 'https://news.google.com/rss/search?q=충북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  chungnam: { name: '충남', url: 'https://news.google.com/rss/search?q=충남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  jeonbuk: { name: '전북', url: 'https://news.google.com/rss/search?q=전북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  jeonnam: { name: '전남', url: 'https://news.google.com/rss/search?q=전남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeongbuk: { name: '경북', url: 'https://news.google.com/rss/search?q=경북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeongnam: { name: '경남', url: 'https://news.google.com/rss/search?q=경남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
};

// 지역 순환 순서 (제주 제외)
export const REGION_ROTATION_ORDER = [
  'seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan',
  'sejong', 'gyeonggi', 'gangwon', 'chungbuk', 'chungnam',
  'jeonbuk', 'jeonnam', 'gyeongbuk', 'gyeongnam'
];

// 오늘 순환 지역 계산 (날짜 기반)
export function getTodayRegion(date: Date): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return REGION_ROTATION_ORDER[dayOfYear % REGION_ROTATION_ORDER.length];
}
```

### 2.2 RSS 파서 구현

```typescript
// lib/rss/collector.ts

import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

interface NewsArticle {
  articleId: string;
  title: string;
  originalUrl: string;
  source: string;
  imageUrl: string | null;
  publishedAt: Date;
  rawContent: string;
  category: string;
  region: string | null;
}

export async function collectRSS(
  url: string,
  category: string,
  region: string | null = null,
  targetDate: Date
): Promise<NewsArticle[]> {
  const feed = await parser.parseURL(url);
  const targetDateStr = targetDate.toISOString().split('T')[0];
  
  const articles: NewsArticle[] = [];
  
  for (const item of feed.items) {
    const pubDate = item.pubDate ? new Date(item.pubDate) : null;
    if (!pubDate) continue;
    
    // 전날 날짜 필터
    const pubDateStr = pubDate.toISOString().split('T')[0];
    if (pubDateStr !== targetDateStr) continue;
    
    const url = item.link || '';
    const articleId = crypto.createHash('md5').update(url).digest('hex');
    
    // 이미지 추출
    let imageUrl: string | null = null;
    if (item['media:content']?.['$']?.url) {
      imageUrl = item['media:content']['$'].url;
    } else if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    }
    
    articles.push({
      articleId,
      title: item.title || '',
      originalUrl: url,
      source: feed.title || 'Unknown',
      imageUrl,
      publishedAt: pubDate,
      rawContent: item.contentSnippet || item.content || item.title || '',
      category,
      region,
    });
  }
  
  return articles;
}

// 중복 제거
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    if (seen.has(a.articleId)) return false;
    seen.add(a.articleId);
    return true;
  });
}
```

---

## 3. Claude API 퀴즈 생성 상세

### 3.1 연령대별 프롬프트 전략

```typescript
// lib/ai/prompts.ts

export const AGE_GROUP_DESCRIPTIONS = {
  '10s': {
    label: '10대 (중·고등학생)',
    style: '쉽고 친근한 언어 사용, 최신 트렌드와 연결, 짧고 임팩트 있는 문장, 유머 OK',
    difficulty: '쉬움 위주 (difficulty 1-2)',
    questionStyle: '흥미 유발, "~가 맞으면 O, 틀리면 X", 연예/스포츠/K팝 연결 선호',
  },
  '20s': {
    label: '20대 (대학생·사회초년생)',
    style: '자연스러운 현대 언어, 사회적 맥락 연결, 배경지식 활용',
    difficulty: '중간 (difficulty 2)',
    questionStyle: '왜?를 묻는 문제, 숫자/통계 활용, 트렌드와 시사 연결',
  },
  '30s': {
    label: '30대 (직장인)',
    style: '명확하고 정확한 언어, 전문 용어 허용, 심층 분석',
    difficulty: '중~어려움 (difficulty 2-3)',
    questionStyle: '영향/결과를 묻는 문제, 정책·경제 연계, 비교 분석',
  },
  '40s': {
    label: '40대',
    style: '격식체 혼용, 역사적 맥락 포함, 전문용어 자유 사용',
    difficulty: '어려움 (difficulty 3)',
    questionStyle: '역사 비교, 정책 심층, 국제 비교, 배경 지식 요구',
  },
  '50s+': {
    label: '50대 이상',
    style: '존중감 있는 언어, 풍부한 경험 기반, 깊이 있는 통찰',
    difficulty: '어려움 (difficulty 3)',
    questionStyle: '맥락 이해, 역사적 의미, 사회 변화 인식, 인물 심층',
  },
};

export function buildQuizPrompt(
  summary: string,
  category: string,
  ageGroup: keyof typeof AGE_GROUP_DESCRIPTIONS,
  count: number = 4
): string {
  const ageDesc = AGE_GROUP_DESCRIPTIONS[ageGroup];
  
  return `
당신은 뉴스 퀴즈 전문 출제자입니다.
다음 뉴스 요약을 바탕으로 ${ageDesc.label}을 위한 퀴즈 ${count}개를 생성해주세요.

[뉴스 요약]
${summary}

[카테고리]
${category}

[연령대 특성]
- 대상: ${ageDesc.label}
- 언어 스타일: ${ageDesc.style}
- 난이도: ${ageDesc.difficulty}
- 문제 유형: ${ageDesc.questionStyle}

[출력 규칙]
1. 반드시 뉴스 요약에 근거한 문제만 출제
2. 객관식 4지선다 ${Math.ceil(count * 0.6)}개, OX퀴즈 ${Math.ceil(count * 0.2)}개, 나머지 단답형
3. 오답 보기도 그럴듯하게 (단순 함정 제외)
4. 해설은 학습 가치 있게 50자 이내
5. 반드시 아래 JSON 형식만 출력 (코드블록, 설명 없음)

{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "문제 텍스트",
      "options": ["①보기1", "②보기2", "③보기3", "④보기4"],
      "correctAnswer": "①보기1",
      "explanation": "정답 해설",
      "difficulty": 2
    },
    {
      "type": "ox",
      "question": "OX 문제 텍스트",
      "options": ["O", "X"],
      "correctAnswer": "O",
      "explanation": "정답 해설",
      "difficulty": 1
    }
  ]
}
`.trim();
}

export function buildSummaryPrompt(title: string, content: string): string {
  return `
다음 뉴스 기사를 퀴즈 출제를 위해 핵심 정보 중심으로 요약해주세요.

[조건]
- 200자 이내
- 반드시 포함: 주요 인물/기관명, 핵심 사건, 날짜/시간, 수치/통계
- 퀴즈로 만들기 좋은 구체적 사실 위주
- 요약 텍스트만 출력 (설명, 레이블 없음)

[기사 제목]
${title}

[기사 내용]
${content}

요약:
`.trim();
}
```

### 3.2 퀴즈 생성 서비스

```typescript
// lib/ai/quiz-generator.ts

import Anthropic from '@anthropic-ai/sdk';
import { buildSummaryPrompt, buildQuizPrompt } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AGE_GROUPS = ['10s', '20s', '30s', '40s', '50s+'] as const;

// 기사 요약 생성
export async function generateSummary(
  title: string,
  content: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: buildSummaryPrompt(title, content),
    }],
  });
  
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// 연령대별 퀴즈 생성
export async function generateQuizForAgeGroup(
  summary: string,
  category: string,
  ageGroup: typeof AGE_GROUPS[number],
  count: number = 4
): Promise<QuizQuestion[]> {
  const prompt = buildQuizPrompt(summary, category, ageGroup, count);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });
  
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.questions || [];
  } catch {
    console.error('Quiz parse error:', text);
    return [];
  }
}

// 전체 파이프라인: 기사 1개 → 전 연령대 퀴즈
export async function generateAllAgeQuizzes(
  articleId: string,
  title: string,
  content: string,
  category: string
): Promise<Record<string, QuizQuestion[]>> {
  // 1. 요약 생성
  const summary = await generateSummary(title, content);
  
  // 2. 연령대별 병렬 생성 (throttle 포함)
  const results: Record<string, QuizQuestion[]> = {};
  
  for (const ageGroup of AGE_GROUPS) {
    try {
      const questions = await generateQuizForAgeGroup(summary, category, ageGroup, 4);
      results[ageGroup] = questions;
      await sleep(2000); // Rate limit 방지
    } catch (error) {
      console.error(`Quiz gen error ${ageGroup}:`, error);
      results[ageGroup] = [];
    }
  }
  
  return results;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
```

---

## 4. 퀴즈셋 구성 로직

### 4.1 카테고리 퀴즈셋 (20문제) 구성
```typescript
// lib/quiz/quiz-set-builder.ts

export function buildCategoryQuizSet(
  allQuestions: QuizQuestion[],
  ageGroup: string,
  targetCount: number = 20
): QuizQuestion[] {
  // 연령대 필터
  const filtered = allQuestions.filter(q => q.ageGroup === ageGroup);
  
  // 유형별 분배 (총 20문제 기준)
  const distribution = {
    'multiple-choice': 12,  // 60%
    'ox': 4,                // 20%
    'short-answer': 2,      // 10%
    'image': 1,             // 5%
    'video': 1,             // 5%
  };
  
  const result: QuizQuestion[] = [];
  
  for (const [type, count] of Object.entries(distribution)) {
    const typeQuestions = filtered
      .filter(q => q.type === type)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    result.push(...typeQuestions);
  }
  
  // 부족분은 객관식으로 채움
  if (result.length < targetCount) {
    const remaining = filtered
      .filter(q => q.type === 'multiple-choice' && !result.includes(q))
      .slice(0, targetCount - result.length);
    result.push(...remaining);
  }
  
  // 셔플
  return result.sort(() => Math.random() - 0.5).slice(0, targetCount);
}

// 데일리 퀴즈셋 (10문제) — 전 카테고리에서 큐레이션
export function buildDailyQuizSet(
  allCategoryQuestions: Record<string, QuizQuestion[]>,
  ageGroup: string
): QuizQuestion[] {
  const categories = Object.keys(allCategoryQuestions);
  const questionsPerCategory = Math.ceil(10 / categories.length);
  
  const selected: QuizQuestion[] = [];
  
  for (const category of categories) {
    const qs = allCategoryQuestions[category]
      .filter(q => q.ageGroup === ageGroup)
      .sort((a, b) => b.stats.accuracyRate - a.stats.accuracyRate) // 적당한 난이도
      .slice(0, questionsPerCategory);
    selected.push(...qs);
  }
  
  return selected
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);
}
```

---

## 5. 수집 결과 모니터링

### 5.1 수집 로그 구조
```typescript
// system_config/collection_logs/{date}
{
  date: '2026-04-14',
  startedAt: Timestamp,
  completedAt: Timestamp,
  status: 'success' | 'partial' | 'failed',
  results: {
    [category: string]: {
      collected: number,
      deduplicated: number,
      saved: number,
      quizGenerated: number,
      errors: string[],
    }
  },
  todayRegion: 'seoul',    // 오늘 순환 지역
  totalCollected: number,
  totalQuizzes: number,
}
```

### 5.2 장애 대응
| 상황 | 대응 |
|------|------|
| RSS 수집 0건 | 재시도 3회, Slack 알림 (향후), 어드민 대시보드 경고 표시 |
| AI 생성 실패 | 해당 기사 스킵, 다음 기사로 진행, 부족분 로그 기록 |
| Firestore 쓰기 실패 | Batch 재시도 2회, 실패 기사 ID 로그 |
| 할당량 초과 | 다음 시간 재시도, 수동 생성 어드민 안내 |
