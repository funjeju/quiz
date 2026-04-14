import { create } from 'zustand';
import { QuizSetWithQuestions, QuizAnswer, QuizGameState } from '@/types';

interface QuizActions {
  startQuiz: (quizSet: QuizSetWithQuestions, sessionId: string) => void;
  submitAnswer: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizGameState & QuizActions>((set) => ({
  currentSet: null,
  currentIndex: 0,
  answers: [],
  sessionId: null,
  startedAt: null,
  status: 'idle',
  combo: 0,
  maxCombo: 0,
  totalScore: 0,

  startQuiz: (quizSet, sessionId) => set({
    currentSet: quizSet,
    currentIndex: 0,
    answers: [],
    sessionId,
    startedAt: new Date(),
    status: 'playing',
    combo: 0,
    maxCombo: 0,
    totalScore: 0,
  }),

  submitAnswer: (answer) => set((state) => {
    const newCombo = answer.isCorrect ? state.combo + 1 : 0;
    const newMaxCombo = Math.max(state.maxCombo, newCombo);
    const newScore = state.totalScore + answer.score;

    return {
      answers: [...state.answers, answer],
      combo: newCombo,
      maxCombo: newMaxCombo,
      totalScore: newScore,
    };
  }),

  nextQuestion: () => set((state) => {
    const nextIndex = state.currentIndex + 1;
    const isLast = state.currentSet && nextIndex >= state.currentSet.questionCount;
    
    return {
      currentIndex: nextIndex,
      status: isLast ? 'completed' : 'playing',
    };
  }),

  resetQuiz: () => set({
    currentSet: null,
    currentIndex: 0,
    answers: [],
    sessionId: null,
    startedAt: null,
    status: 'idle',
    combo: 0,
    maxCombo: 0,
    totalScore: 0,
  }),
}));
