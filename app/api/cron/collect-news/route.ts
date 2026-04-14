import { adminDb } from '@/lib/firebase/admin';
import { RSS_SOURCES, REGION_RSS_SOURCES, getTodayRegion } from '@/lib/rss/sources';
import { collectRSS, deduplicateArticles } from '@/lib/rss/collector';
import { getPipelineConfig } from '@/lib/admin/config-service';
import { CollectionLog, CollectionResult } from '@/types/admin';

export async function GET(request: NextRequest) {
  // 1. 보안 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // 로컬 개발 환경에서의 수동 호출을 위해 일부 허용하거나 에러 반환
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 1.5 오토파일럿 체크
  const config = await getPipelineConfig();
  if (!config.isAutoPilotEnabled) {
    console.log('Cron skipped: AutoPilot is disabled');
    return NextResponse.json({ success: true, message: 'Skipped - AutoPilot disabled' });
  }

  const startTime = new Date();

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - 1); // 전날 뉴스 수집 (선택 가능)
  
  const results: any[] = [];
  const allArticles: any[] = [];

  try {
    const categoryResults: Record<string, CollectionResult> = {};

    // 2. 전국 카테고리 수집
    for (const [key, source] of Object.entries(RSS_SOURCES)) {
      let catCount = 0;
      for (const url of source.urls) {
        const articles = await collectRSS(url, key, null, targetDate);
        allArticles.push(...articles);
        catCount += articles.length;
      }
      categoryResults[key] = {
        category: key,
        collected: catCount,
        deduplicated: 0, // After processing
        saved: 0,
        errors: [],
      };
    }

    // 3. 지역 카테고리 (제주 고정 + 오늘 순환 지역)
    const todayRegion = getTodayRegion(today);
    const regionsToCollect = ['jeju', todayRegion];

    for (const regKey of regionsToCollect) {
      const source = (REGION_RSS_SOURCES as any)[regKey];
      if (source) {
        const articles = await collectRSS(source.url, 'region', regKey, targetDate);
        allArticles.push(...articles);
      }
    }

    // 4. 중복 제거
    const uniqueArticles = deduplicateArticles(allArticles);

    // 5. Firestore Batch 저장
    const batchSize = 500;
    for (let i = 0; i < uniqueArticles.length; i += batchSize) {
      const batch = adminDb.batch();
      const chunk = uniqueArticles.slice(i, i + batchSize);
      
      chunk.forEach((article) => {
        const docRef = adminDb.collection('news_articles').doc(article.articleId);
        batch.set(docRef, {
          ...article,
          publishedAt: article.publishedAt, // Date 객체 유지 (Admin SDK가 처리)
          collectedAt: article.collectedAt,
        }, { merge: true });
      });
      
      await batch.commit();
    }

    // 6. 로그 저장
    const log: CollectionLog = {
      date: targetDate.toISOString().split('T')[0],
      startedAt: startTime,
      completedAt: new Date(),
      status: 'success',
      results: categoryResults,
      todayRegion,
      totalCollected: allArticles.length,
      totalQuizzes: 0, // Will be updated by generate-quiz or stats
    };
    await adminDb.collection('collection_logs').add(log);

    return NextResponse.json({
      success: true,
      totalCollected: allArticles.length,
      uniqueSaved: uniqueArticles.length,
      regionCollected: todayRegion,
    });
  } catch (error: any) {
    console.error('Core Pipeline Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
