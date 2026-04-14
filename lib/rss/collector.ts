import Parser from 'rss-parser';
import crypto from 'crypto';
import { NewsArticle } from '@/types';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

export async function collectRSS(
  url: string,
  category: string,
  region: string | null = null,
  targetDate: Date
): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    const articles: NewsArticle[] = [];
    
    for (const item of feed.items) {
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      if (!pubDate) continue;
      
      // 날짜 필터 (당일 또는 지정된 날짜)
      const pubDateStr = pubDate.toISOString().split('T')[0];
      if (pubDateStr !== targetDateStr) continue;
      
      const link = item.link || '';
      const articleId = crypto.createHash('md5').update(link).digest('hex');
      
      // 이미지 추출
      let imageUrl: string | null = null;
      if (item['media:content']?.['$']?.url) {
        imageUrl = item['media:content']['$'].url;
      } else if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      }
      
      articles.push({
        articleId,
        title: item.title || '',
        summary: '', // AI 생성 전에는 비어있음
        originalUrl: link,
        source: feed.title || 'Unknown',
        imageUrl,
        publishedAt: pubDate,
        collectedAt: new Date(),
        collectedDate: targetDateStr,
        category: category as any,
        region,
        quizGenerated: false,
        quizSetId: null,
      });
    }
    
    return articles;
  } catch (error) {
    console.error(`RSS collection error (${url}):`, error);
    return [];
  }
}

export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    if (seen.has(a.articleId)) return false;
    seen.add(a.articleId);
    return true;
  });
}
