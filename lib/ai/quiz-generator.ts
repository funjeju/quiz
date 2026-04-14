import { geminiModel } from './client';
import { buildSummaryPrompt, buildQuizPrompt } from './prompts';

const AGE_GROUPS = ['10s', '20s', '30s', '40s', '50s+'] as const;

export async function generateSummary(
  title: string,
  content: string
): Promise<string> {
  const prompt = buildSummaryPrompt(title, content);
  const result = await geminiModel.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateQuizForAgeGroup(
  summary: string,
  category: string,
  ageGroup: typeof AGE_GROUPS[number],
  count: number = 4
): Promise<any[]> {
  const prompt = buildQuizPrompt(summary, category, ageGroup, count);
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.questions || [];
  } catch {
    console.error('Quiz parse error:', text);
    return [];
  }
}

export async function generateAllAgeQuizzes(
  articleId: string,
  title: string,
  content: string,
  category: string
): Promise<Record<string, any[]>> {
  // 1. 요약 생성
  const summary = await generateSummary(title, content);
  
  // 2. 연령대별 병렬 생성 (throttle 포함)
  const results: Record<string, any[]> = {};
  
  for (const ageGroup of AGE_GROUPS) {
    try {
      const questions = await generateQuizForAgeGroup(summary, category, ageGroup, 4);
      results[ageGroup] = questions;
      await new Promise(r => setTimeout(r, 1000)); // Rate limit 방지
    } catch (error) {
      console.error(`Quiz gen error ${ageGroup}:`, error);
      results[ageGroup] = [];
    }
  }
  
  return results;
}
