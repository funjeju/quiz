import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getPipelineConfig } from '@/lib/admin/config-service';
import { startOfDay, endOfDay, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export async function GET(request: NextRequest) {
  try {
    const config = await getPipelineConfig();
    
    // KST 시간대 설정
    const TIMEZONE = 'Asia/Seoul';
    const now = toZonedTime(new Date(), TIMEZONE);
    const todayStr = format(now, 'yyyy-MM-dd');
    const todayStart = startOfDay(now);

    // 1. 통계 집계 (최적화를 위해 Parallel 실행)
    const [
      totalUsersSnap,
      newUsersSnap,
      todayNewsSnap,
      todayQuizSnap,
      totalSessionsSnap,
      recentLogsSnap
    ] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('users').where('createdAt', '>=', todayStart).count().get(),
      adminDb.collection('news_articles').where('collectedDate', '==', todayStr).count().get(),
      adminDb.collection('news_articles').where('collectedDate', '==', todayStr).where('quizGenerated', '==', true).count().get(),
      adminDb.collection('quiz_sessions').count().get(),
      adminDb.collection('collection_logs').orderBy('completedAt', 'desc').limit(5).get(),
    ]);

    const stats = {
      totalUsers:     totalUsersSnap.data().count,
      newUsersToday:  newUsersSnap.data().count,
      todayCollected: todayNewsSnap.data().count,
      todayQuizzes:   todayQuizSnap.data().count,
      totalPlays:     totalSessionsSnap.data().count,
    };

    const logs = recentLogsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data().startedAt.toDate(),
      completedAt: doc.data().completedAt.toDate(),
    }));

    return NextResponse.json({
      success: true,
      config,
      stats,
      logs,
    });
  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
