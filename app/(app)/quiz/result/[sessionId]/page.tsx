'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuizStore as useQuizGameStore } from '@/stores/quizStore';
import { Trophy, Share2, Home, RotateCcw } from 'lucide-react';

export default function QuizResultPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const quizGame = useQuizGameStore();

  const totalQuestions = quizGame.currentSet?.questionCount || 0;
  const correctCount = quizGame.answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;

  return (
    <div className="container mx-auto max-w-md p-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mb-2">
          <Trophy size={40} />
        </div>
        <h1 className="text-3xl font-black">퀴즈 종료!</h1>
        <p className="text-muted-foreground font-medium">수고하셨습니다. 당신의 결과는?</p>
      </div>

      <Card className="border-none shadow-2xl bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-6xl font-black text-indigo-600">
            {quizGame.totalScore.toLocaleString()}
          </CardTitle>
          <p className="text-sm font-bold text-indigo-400">TOTAL SCORE</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pt-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-1 text-center border">
            <span className="text-2xl font-black text-slate-800">{accuracy}%</span>
            <p className="text-xs font-bold text-muted-foreground">정답률</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-1 text-center border">
            <span className="text-2xl font-black text-orange-500">{quizGame.maxCombo}</span>
            <p className="text-xs font-bold text-muted-foreground">최고 콤보</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-1 text-center border col-span-2">
            <span className="text-xl font-bold text-emerald-600">+{Math.round(quizGame.totalScore / 10)} P</span>
            <p className="text-xs font-bold text-muted-foreground">적립 포인트</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg">
            <Share2 className="mr-2" size={20} />
            카카오톡으로 자랑하기
          </Button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => router.push('/dashboard')}>
              <Home className="mr-2" size={18} />
              홈으로
            </Button>
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => router.refresh()}>
              <RotateCcw className="mr-2" size={18} />
              다시 도전
            </Button>
          </div>
        </CardFooter>
      </Card>

      <section className="space-y-4">
        <h3 className="font-bold text-lg px-1">정답 분석</h3>
        <div className="space-y-2">
          {quizGame.answers.map((answer, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
              <span className="font-bold text-slate-600">Q{i + 1}</span>
              <Badge variant={answer.isCorrect ? 'default' : 'destructive'} className="rounded-full">
                {answer.isCorrect ? 'SUCCESS' : 'FAILED'}
              </Badge>
              <span className="text-sm font-medium text-slate-400">{(answer.timeSpent / 1000).toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
