# 모두의퀴즈 — 전체 문서 인덱스 (README.md)

> **Claude Code에 이 파일을 먼저 전달하고, `CLAUDE_CODE_PROMPT.md`를 실행 지시서로 사용하세요.**

---

## 📁 문서 목록

| 파일명 | 용도 | Claude Code 우선순위 |
|--------|------|---------------------|
| `CLAUDE_CODE_PROMPT.md` | ⭐ **Claude Code 실행 지시서** (가장 먼저) | 🔴 필수 |
| `PRD.md` | 전체 제품 요구사항 | 🔴 필수 |
| `ARCHITECTURE.md` | 기술 아키텍처, DB 스키마, API 설계 | 🔴 필수 |
| `PIPELINE.md` | RSS 수집 코드, AI 생성 코드 (복사 가능) | 🔴 필수 |
| `PROJECT_STRUCTURE.md` | 전체 폴더/파일 구조 | 🔴 필수 |
| `TYPES.md` | TypeScript 타입 (복사 가능) | 🔴 필수 |
| `UI_UX.md` | 컬러 시스템, 화면 설계 | 🟡 중요 |
| `ADMIN_SYSTEM.md` | 어드민 대시보드 상세 | 🟡 중요 |
| `GAMIFICATION.md` | 점수, 랭킹, 포인트, 대회 | 🟡 중요 |
| `SETUP.md` | 환경 설정, 배포 | 🟡 중요 |
| `BUSINESS.md` | 비즈니스 모델, 성장 전략 | 🟢 참고 |

---

## 🚀 빠른 시작

### Claude Code에 전달하는 순서
```
1. 이 README.md 전달
2. CLAUDE_CODE_PROMPT.md 전달 (실행 지시)
3. 나머지 문서는 Claude Code가 참조하며 작업
```

### 개발자가 직접 시작하는 경우
```bash
# 1. 환경 설정: SETUP.md 참조
# 2. .env.local 작성
# 3. npm run dev
```

---

## 🏗️ 서비스 핵심 요약

```
모두의퀴즈 = 뉴스 × AI × 게임

[매일 06:00] Google RSS 수집
    ↓ 카테고리 10개 + 제주(고정) + 순환 지역 1개
    ↓ 카테고리당 25개 기사

[06:30~08:00] Claude AI 처리
    ↓ 기사 200자 요약
    ↓ 연령대별(10대/20대/30대/40대/50대+) 퀴즈 생성
    ↓ 카테고리당 20문제 × 5연령대 = 100문제

[09:00] 퀴즈 자동 배포 → 사용자 플레이 시작

[플레이] 속도+정확도 점수 → 랭킹 → 카카오 공유 → 바이럴
```

---

## 🔑 핵심 설계 결정사항

| 결정 | 이유 |
|------|------|
| Google RSS (무료) | API 비용 없음, 한국어 최적화 |
| Claude API (유료) | 한국어 품질 최고, 연령대별 맞춤화 |
| Firebase Firestore | 실시간 랭킹, 확장성, Auth 통합 |
| Vercel Cron | 별도 서버 불필요, 무료 티어 |
| shadcn/ui | 빠른 개발, 다크모드 기본 지원 |
| 제주 고정 + 순환 지역 | 지역 뉴스 커버리지 + API 비용 절감 |
| 연령대별 퀴즈 분기 | 같은 뉴스를 5세트로 재활용 = 비용 효율 |
| 서버사이드 점수 계산 | 점수 조작 방지 |

---

## 📊 기술 스택 요약

```
Frontend:  Next.js 14 (App Router) + shadcn/ui + Tailwind + Framer Motion
Backend:   Next.js API Routes (Edge)
Database:  Firebase Firestore (실시간) + Firebase Storage (미디어)
Auth:      Firebase Authentication (Google OAuth)
AI:        Anthropic Claude API (claude-sonnet-4-20250514)
RSS:       rss-parser (Google News RSS)
State:     Zustand (클라이언트) + TanStack Query (서버)
Deploy:    Vercel (자동배포 + Cron Jobs)
Share:     Kakao SDK
```

---

## ⚙️ 환경변수 빠른 참조

```env
NEXT_PUBLIC_FIREBASE_*        Firebase 클라이언트 설정
FIREBASE_ADMIN_*              Firebase Admin (서버용)
ANTHROPIC_API_KEY             Claude API 키
CRON_SECRET                   Vercel Cron 보호용 시크릿
NEXT_PUBLIC_KAKAO_APP_KEY     카카오 SDK (향후)
NEXT_PUBLIC_APP_URL           배포 URL
```

---

*모두의퀴즈 — 뉴스를 퀴즈로, 지식과 재미를 동시에* 🧠🏆
