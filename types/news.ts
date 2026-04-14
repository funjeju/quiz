export type CategoryType =
  | 'entertainment'
  | 'current-affairs'
  | 'international'
  | 'sports'
  | 'kpop'
  | 'ai-tech'
  | 'politics'
  | 'travel'
  | 'people'
  | 'it';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  'entertainment':  '연예',
  'current-affairs':'시사',
  'international':  '국제',
  'sports':         '스포츠',
  'kpop':           'K팝',
  'ai-tech':        'AI',
  'politics':       '정치',
  'travel':         '여행',
  'people':         '인물',
  'it':             'IT',
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'entertainment':  '#EC4899',
  'current-affairs':'#3B82F6',
  'international':  '#10B981',
  'sports':         '#F97316',
  'kpop':           '#A855F7',
  'ai-tech':        '#06B6D4',
  'politics':       '#EF4444',
  'travel':         '#84CC16',
  'people':         '#F59E0B',
  'it':             '#6366F1',
};

export interface NewsArticle {
  articleId:      string;
  title:          string;
  summary:        string;
  originalUrl:    string;
  source:         string;
  imageUrl:       string | null;
  category:       CategoryType;
  region:         string | null;
  publishedAt:    Date;
  collectedAt:    Date;
  collectedDate:  string;                  // 'YYYY-MM-DD'
  quizGenerated:  boolean;
  quizSetId:      string | null;
}
