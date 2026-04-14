import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ageGroup = searchParams.get('ageGroup');
    const limit    = parseInt(searchParams.get('limit') || '20');

    let query: any = adminDb.collection('quiz_questions')
      .orderBy('order', 'asc')
      .limit(limit);

    if (ageGroup && ageGroup !== 'all') {
      query = query.where('ageGroup', '==', ageGroup);
    }

    const snapshot = await query.get();
    
    // 퀴즈 문제와 관련된 기사 정보를 가져오기
    const questions = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      let articleTitle = 'Unknown Article';
      
      if (data.newsArticleId) {
        const articleSnap = await adminDb.collection('news_articles').doc(data.newsArticleId).get();
        if (articleSnap.exists) {
          articleTitle = articleSnap.data()?.title || 'No Title';
        }
      }

      return {
        id: doc.id,
        ...data,
        articleTitle,
      };
    }));

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error: any) {
    console.error('Admin Quiz API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
