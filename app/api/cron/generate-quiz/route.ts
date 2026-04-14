import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateAllAgeQuizzes } from '@/lib/ai/quiz-generator';
import { QuizQuestion } from '@/types';
import crypto from 'crypto';
import { getPipelineConfig } from '@/lib/admin/config-service';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Autopilot check
  const config = await getPipelineConfig();
  if (!config.isAutoPilotEnabled) {
    return NextResponse.json({ success: true, message: 'Skipped - AutoPilot disabled' });
  }

  try {
    // 1. 퀴즈가 생성되지 않은 최근 기사 5개 가져오기 (배치 처리)
    const newsSnap = await adminDb.collection('news_articles')
      .where('quizGenerated', '==', false)
      .orderBy('collectedAt', 'desc')
      .limit(5)
      .get();

    if (newsSnap.empty) {
      return NextResponse.json({ message: 'No pending articles found' });
    }

    const generationResults = [];

    for (const newsDoc of newsSnap.docs) {
      const article = newsDoc.data();
      
      // 2. AI 퀴즈 생성 호출 (모든 연령대)
      const quizzesByAge = await generateAllAgeQuizzes(
        newsDoc.id,
        article.title,
        article.rawContent || article.title,
        article.category
      );

      const batch = adminDb.batch();
      
      // 3. 퀴즈 문제 저장
      for (const [ageGroup, questions] of Object.entries(quizzesByAge)) {
        questions.forEach((q: any, index: number) => {
          const questionId = crypto.createHash('md5')
            .update(`${newsDoc.id}-${ageGroup}-${index}`)
            .digest('hex');
          
          const questionData: Partial<QuizQuestion> = {
            questionId,
            newsArticleId: newsDoc.id,
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            ageGroup: ageGroup as any,
            category: article.category,
            stats: { totalAttempts: 0, correctCount: 0, accuracyRate: 0 },
            order: index,
          };

          const qRef = adminDb.collection('quiz_questions').doc(questionId);
          batch.set(qRef, questionData);
        });
      }

      // 4. 기사 상태 업데이트
      batch.update(newsDoc.ref, { quizGenerated: true });
      
      await batch.commit();
      generationResults.push({ articleId: newsDoc.id, title: article.title });
    }

    return NextResponse.json({
      success: true,
      generatedCount: generationResults.length,
      articles: generationResults,
    });
  } catch (error: any) {
    console.error('Quiz Generation Pipeline Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
