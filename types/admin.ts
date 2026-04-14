import type { CategoryType, AgeGroup } from '.';

export interface CollectionResult {
  category:      string;
  collected:     number;
  deduplicated:  number;
  saved:         number;
  errors:        string[];
}

export interface CollectionLog {
  date:          string;
  startedAt:     Date;
  completedAt:   Date;
  status:        'success' | 'partial' | 'failed';
  results:       Record<string, CollectionResult>;
  todayRegion:   string;
  totalCollected:number;
  totalQuizzes:  number;
}

export interface GenerateQuizRequest {
  date:       string;
  category:   CategoryType;
  ageGroups:  AgeGroup[];
  count:      number;           // 연령대별 문제 수
  publishAt?: string;           // ISO string, null = draft
}

export interface AdminStats {
  todayCollected:    number;
  todayQuizzes:      number;
  todayPlayers:      number;
  totalUsers:        number;
  newUsersToday:     number;
  publishedSets:     number;
  pendingSets:       number;
  avgScore:          number;
}
