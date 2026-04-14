import type { AgeGroup, CategoryType } from '.';

export type QuizType       = 'multiple-choice' | 'ox' | 'short-answer' | 'image' | 'video';
export type QuizStatus     = 'draft' | 'scheduled' | 'published' | 'archived';
export type QuizDifficulty = 1 | 2 | 3;
export type SessionStatus  = 'in-progress' | 'completed' | 'abandoned';

export interface QuizQuestion {
  questionId:    string;
  setId:         string;
  newsArticleId: string;
  type:          QuizType;
  question:      string;
  options:       string[] | null;
  correctAnswer: string;
  explanation:   string;
  imageUrl:      string | null;
  videoUrl:      string | null;
  videoStart:    number | null;
  videoEnd:      number | null;
  difficulty:    QuizDifficulty;
  ageGroup:      AgeGroup | 'all';
  category:      CategoryType;
  order:         number;
  stats: {
    totalAttempts: number;
    correctCount:  number;
    accuracyRate:  number;
  };
}

export interface QuizSet {
  setId:          string;
  date:           string;                  // 'YYYY-MM-DD'
  category:       CategoryType | 'daily';
  ageGroup:       AgeGroup | 'all';
  region:         string | null;
  questionIds:    string[];
  questionCount:  number;
  status:         QuizStatus;
  publishAt:      Date;
  createdAt:      Date;
  createdBy:      'auto' | string;
  stats: {
    totalPlays:    number;
    avgScore:      number;
    avgAccuracy:   number;
  };
}

export interface QuizSetWithQuestions extends QuizSet {
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId:  string;
  userAnswer:  string;
  isCorrect:   boolean;
  timeSpent:   number;                     // ms
  score:       number;
}

export interface QuizSession {
  sessionId:      string;
  userId:         string;
  quizSetId:      string;
  category:       CategoryType | 'daily';
  date:           string;
  startedAt:      Date;
  completedAt:    Date | null;
  status:          SessionStatus;
  answers:        QuizAnswer[];
  totalScore:     number;
  totalTime:      number;                  // ms
  correctCount:   number;
  totalQuestions: number;
  combo: {
    maxCombo:     number;
    currentCombo: number;
  };
}

// 클라이언트 게임 상태 (Zustand store)
export interface QuizGameState {
  currentSet:      QuizSetWithQuestions | null;
  currentIndex:    number;
  answers:         QuizAnswer[];
  sessionId:       string | null;
  startedAt:       Date | null;
  status:          'idle' | 'playing' | 'reviewing' | 'completed';
  combo:           number;
  maxCombo:        number;
  totalScore:      number;
}
