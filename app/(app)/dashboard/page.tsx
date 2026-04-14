'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS, CATEGORY_COLORS, CategoryType } from '@/types';
import { Trophy, Zap, Globe, Film, Music, Cpu, Landmark, Palmtree, Users, Tv } from 'lucide-react';

const CATEGORY_ICONS: Record<CategoryType, any> = {
  'entertainment': Tv,
  'current-affairs': Landmark,
  'international': Globe,
  'sports': Zap,
  'kpop': Music,
  'ai-tech': Cpu,
  'politics': Users,
  'travel': Palmtree,
  'people': Film,
  'it': Cpu,
};

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl p-4 pb-24 space-y-8">
      {/* 데일리 퀴즈 배너 */}
      <section>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl">
          <CardHeader className="pt-8 text-center">
            <Badge className="bg-white/20 text-white border-none mb-2 hover:bg-white/30 self-center px-4 py-1">
              오늘의 도전
            </Badge>
            <CardTitle className="text-3xl font-extrabold tracking-tight">지식 왕중왕전</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              오늘의 뉴스로 두뇌를 깨우세요! (10문제)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 text-center">
            <Button 
                size="lg" 
                className="h-14 px-12 bg-white text-indigo-700 hover:bg-indigo-50 text-xl font-black rounded-full shadow-lg transition-all hover:scale-105"
                onClick={() => router.push('/quiz/daily')}
            >
              지금 플레이
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* 카테고리 그리드 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight px-1">카테고리 퀴즈</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const color = CATEGORY_COLORS[key];
            
            return (
              <Button
                key={key}
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all p-2"
                onClick={() => router.push(`/quiz/category/${key}`)}
              >
                <div 
                    className="p-3 rounded-full text-white"
                    style={{ backgroundColor: color }}
                >
                  <Icon size={24} />
                </div>
                <span className="font-bold text-base">{CATEGORY_LABELS[key]}</span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* 명예의 전당 (간략화) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-bold tracking-tight">명예의 전당</h2>
          <Button variant="link" onClick={() => router.push('/ranking')}>전체 보기</Button>
        </div>
        <Card className="border-none bg-slate-100/50">
          <CardContent className="p-6 flex items-center justify-around">
            <div className="flex flex-col items-center gap-2 opacity-70">
              <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300" />
              <span className="text-sm font-medium">Rank 2</span>
            </div>
            <div className="flex flex-col items-center gap-2 scale-110">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-200 border-4 border-indigo-500 flex items-center justify-center">
                   <Trophy className="text-indigo-600" size={32} />
                </div>
                <div className="absolute -top-4 -right-2">👑</div>
              </div>
              <span className="text-lg font-black text-indigo-600">Rank 1</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-70">
              <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-200" />
              <span className="text-sm font-medium">Rank 3</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
