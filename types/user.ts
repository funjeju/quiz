export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s+';
export type Gender   = 'male' | 'female' | 'other';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid:              string;
  email:            string;
  displayName:      string;
  photoURL:         string;
  nickname:         string;
  gender:           Gender | null;
  ageGroup:         AgeGroup | null;
  region:           string | null;         // e.g., 'jeju', 'seoul'
  role:             UserRole;
  totalPoints:      number;
  profileCompleted: boolean;
  createdAt:        Date;
  lastLoginAt:      Date;
  stats: UserStats;
}

export interface UserStats {
  totalQuizzes:    number;
  totalCorrect:    number;
  avgScore:        number;
  streakDays:      number;
  lastPlayDate:    string;                 // 'YYYY-MM-DD'
  badges:          string[];
}
