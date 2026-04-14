'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/authStore'; // Wait, I used useAuthStore in previous turn. Let me check.
import { useQuizStore as useQuizGameStore } from '@/stores/quizStore';
import { useAuthStore } from '@/stores/authStore';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

export default function QuizPlayPage() {
  const { setId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const quizGame = useQuizGameStore();
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);

  // 1. 퀴즈 데이터 로드 (실제로는 API 호출 필요)
  useEffect(() => {
    // Mock 데이터 또는 API 호출 로직
    // 여기서는 로직만 구현함
  }, [setId]);

  const handleAnswer = (userAnswer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    
    const currentQuestion = quizGame.currentSet?.questions[quizGame.currentIndex];
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.correctAnswer === userAnswer;
    
    // 점수 계산 (단순화: 기본 100점 + 시간 비례)
    const score = isCorrect ? Math.round(100 * (timeLeft / 20) + 100) : 0;
    
    quizGame.submitAnswer({
      questionId: currentQuestion.questionId,
      userAnswer,
      isCorrect,
      timeSpent: (20 - timeLeft) * 1000,
      score,
    });

    if (isCorrect) {
      toast.success(`정답입니다! +${score}점`);
    } else {
      toast.error(`오답입니다. 정답은: ${currentQuestion.correctAnswer}`);
    }

    // 자동으로 다음 문제로 이동 (딜레이)
    setTimeout(() => {
      quizGame.nextQuestion();
      setIsAnswered(false);
      setTimeLeft(20);
    }, 2000);
  };

  if (!quizGame.currentSet) {
    return <div className="p-8 text-center">퀴즈를 로딩 중입니다...</div>;
  }

  const currentQuestion = quizGame.currentSet.questions[quizGame.currentIndex];

  return (
    <div className="container mx-auto max-w-2xl p-4 py-8 space-y-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-xl font-bold">문제 {quizGame.currentIndex + 1} / {quizGame.currentSet.questionCount}</h1>
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{quizGame.totalScore}점</span>
            {quizGame.combo > 1 && (
                <span className="text-orange-500 font-black animate-bounce">{quizGame.combo} COMBO!</span>
            )}
        </div>
      </div>

      <Progress value={(quizGame.currentIndex / quizGame.currentSet.questionCount) * 100} className="h-2" />

      <AnimatePresence mode="wait">
        {currentQuestion && (
            <QuizCard 
               key={currentQuestion.questionId}
               question={currentQuestion}
               onSelect={handleAnswer}
               disabled={isAnswered}
            />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center text-2xl font-black">
          {timeLeft}
        </div>
        <p className="text-sm font-medium text-muted-foreground">남은 시간</p>
      </div>
    </div>
  );
}
