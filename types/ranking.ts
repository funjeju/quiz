import type { AgeGroup, Gender } from '.';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RankEntry {
  userId:       string;
  nickname:     string;
  photoURL:     string;
  score:        number;
  correctCount: number;
  totalTime:    number;
  ageGroup:     AgeGroup;
  gender:       Gender | 'other';
  region:       string;
  rank:         number;
  completedAt:  Date;
}

export interface RankingFilter {
  period:   RankingPeriod;
  ageGroup: AgeGroup | 'all';
  gender:   Gender | 'all';
  region:   string | 'all';
  category: string | 'all';
}

export interface PointTransaction {
  txId:      string;
  userId:    string;
  amount:    number;
  type:      'earn' | 'spend';
  reason:    string;
  balance:   number;
  createdAt: Date;
}
