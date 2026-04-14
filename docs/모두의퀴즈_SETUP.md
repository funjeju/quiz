# 모두의퀴즈 — 개발 환경 설정 가이드 (SETUP.md)

---

## 1. 사전 요구사항

```bash
Node.js >= 18.17.0
npm >= 9.0.0
Git
Firebase CLI
Vercel CLI (선택)
```

---

## 2. 프로젝트 초기화

### 2.1 Next.js 프로젝트 생성
```bash
npx create-next-app@latest moquiz \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd moquiz
```

### 2.2 shadcn/ui 설치
```bash
npx shadcn@latest init

# 필요한 컴포넌트 설치
npx shadcn@latest add button card badge dialog progress tabs
npx shadcn@latest add table input textarea select label
npx shadcn@latest add dropdown-menu avatar separator sheet
npx shadcn@latest add toast sonner skeleton
npx shadcn@latest add chart   # Recharts 기반
```

### 2.3 주요 패키지 설치
```bash
# Firebase
npm install firebase firebase-admin

# Anthropic Claude
npm install @anthropic-ai/sdk

# RSS 파서
npm install rss-parser

# 상태관리
npm install zustand
npm install @tanstack/react-query

# 애니메이션
npm install framer-motion

# 유틸리티
npm install date-fns
npm install crypto-js
npm install clsx tailwind-merge

# 타입
npm install -D @types/rss-parser
```

### 2.4 Pretendard 폰트 설정
```bash
npm install pretendard
```

```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});
```

---

## 3. Firebase 설정

### 3.1 Firebase 프로젝트 생성
1. https://console.firebase.google.com 접속
2. 새 프로젝트 생성: `moquiz-prod`
3. Google Analytics 활성화

### 3.2 서비스 활성화
```
Authentication:
  - Sign-in providers → Google 활성화
  - Authorized domains → moquiz.kr, localhost 추가

Firestore Database:
  - 데이터베이스 만들기 → 프로덕션 모드
  - 위치: asia-northeast3 (서울)

Storage:
  - 시작하기 → 프로덕션 모드
```

### 3.3 Firebase 클라이언트 설정
```typescript
// lib/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```

### 3.4 Firebase Admin 설정
```typescript
// lib/firebase/admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const adminApp = getApps().find(a => a.name === 'admin') ||
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }, 'admin');

export const adminDb   = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
```

### 3.5 Firestore Security Rules 배포
```bash
# firebase.json 생성
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}

# 규칙 배포
firebase deploy --only firestore:rules
```

---

## 4. 환경변수 설정

### `.env.local` 생성
```env
# ===== Firebase 클라이언트 =====
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moquiz-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=moquiz-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moquiz-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ===== Firebase Admin (서버사이드) =====
FIREBASE_ADMIN_PROJECT_ID=moquiz-prod
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@moquiz-prod.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ===== Anthropic Claude API =====
ANTHROPIC_API_KEY=sk-ant-api03-...

# ===== Vercel Cron 보안 =====
CRON_SECRET=your-random-secret-string-here

# ===== 카카오 SDK (향후) =====
NEXT_PUBLIC_KAKAO_APP_KEY=

# ===== 앱 설정 =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=모두의퀴즈
```

---

## 5. Vercel 배포 설정

### 5.1 `vercel.json`
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
      "path": "/api/cron/publish-quiz",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/update-rankings",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

> **주의**: KST = UTC+9. KST 06:00 = UTC 21:00 (전날)

### 5.2 Cron 핸들러 보안
```typescript
// app/api/cron/collect-news/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Vercel Cron 또는 수동 호출 모두 시크릿 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... 수집 로직
}
```

### 5.3 배포 명령어
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경변수 설정 (Vercel 대시보드에서도 가능)
vercel env add ANTHROPIC_API_KEY

# 프로덕션 배포
vercel --prod
```

---

## 6. Firestore 인덱스 설정

### `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "news_articles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category",       "order": "ASCENDING" },
        { "fieldPath": "collectedDate",  "order": "DESCENDING" },
        { "fieldPath": "quizGenerated",  "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "quiz_sets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date",     "order": "DESCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status",   "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "quiz_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId",   "order": "ASCENDING" },
        { "fieldPath": "date",     "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 7. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000

# 빌드 테스트
npm run build
npm run start

# 타입 체크
npm run type-check

# 린트
npm run lint
```

---

## 8. 최초 어드민 계정 설정

```typescript
// scripts/set-admin.ts — 1회성 실행 스크립트
import { adminDb, adminAuth } from '../lib/firebase/admin';

async function setAdmin(email: string) {
  const user = await adminAuth.getUserByEmail(email);
  await adminDb.doc(`users/${user.uid}`).update({ role: 'admin' });
  console.log(`Admin set for: ${email}`);
}

// 실행
setAdmin('admin@yourdomain.com');
```

```bash
# 한번만 실행
npx ts-node scripts/set-admin.ts
```

---

## 9. 개발 체크리스트

### 환경 설정
- [ ] Firebase 프로젝트 생성
- [ ] Google OAuth 활성화
- [ ] Firestore, Storage 활성화
- [ ] `.env.local` 작성
- [ ] Firestore Rules 배포
- [ ] Firestore Indexes 배포

### 기능 개발 순서 (권장)
- [ ] Firebase Auth + Google 로그인
- [ ] 온보딩 (프로필 설정)
- [ ] RSS 수집 API
- [ ] Claude 요약 + 퀴즈 생성 API
- [ ] 퀴즈 플레이 UI
- [ ] 점수 계산 + 제출 API
- [ ] 랭킹 시스템
- [ ] 어드민 대시보드
- [ ] 카카오 공유
- [ ] Vercel Cron 설정
- [ ] 프로덕션 배포
