import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit    = parseInt(searchParams.get('limit') || '20');

    let query: any = adminDb.collection('news_articles')
      .orderBy('collectedAt', 'desc')
      .limit(limit);

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const news = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      publishedAt: doc.data().publishedAt.toDate(),
      collectedAt: doc.data().collectedAt.toDate(),
    }));

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error: any) {
    console.error('Admin News API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
