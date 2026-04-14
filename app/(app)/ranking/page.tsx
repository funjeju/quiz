'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, MapPin, Users } from 'lucide-react';

const MOCK_RANKING = [
  { rank: 1, nickname: '지식마왕', score: 4850, time: 142, ageGroup: '30s', region: 'seoul', photo: '' },
  { rank: 2, nickname: '퀴즈천재', score: 4720, time: 155, ageGroup: '20s', region: 'busan', photo: '' },
  { rank: 3, nickname: '제주바람', score: 4600, time: 168, ageGroup: '10s', region: 'jeju', photo: '' },
  { rank: 4, nickname: '독서왕', score: 4450, time: 180, ageGroup: '40s', region: 'gyeonggi', photo: '' },
  { rank: 5, nickname: '뉴스매니아', score: 4300, time: 195, ageGroup: '30s', region: 'incheon', photo: '' },
];

export default function RankingPage() {
  const [period, setPeriod] = useState('daily');

  return (
    <div className="container mx-auto max-w-2xl p-4 py-8 pb-24 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">리더보드</h1>
        <p className="text-muted-foreground font-medium">실시간으로 업데이트되는 모두의 순위</p>
      </div>

      <Tabs defaultValue="daily" onValueChange={setPeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="daily" className="rounded-lg font-bold">일간</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg font-bold">주간</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-lg font-bold">월간</TabsTrigger>
        </TabsList>

        <div className="flex gap-2 mt-4">
            <Select defaultValue="all">
                <SelectTrigger className="flex-1 rounded-xl">
                    <SelectValue placeholder="연령대" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">전체 연령</SelectItem>
                    <SelectItem value="10s">10대</SelectItem>
                    <SelectItem value="20s">20대</SelectItem>
                    <SelectItem value="30s">30대</SelectItem>
                    <SelectItem value="40s">40대</SelectItem>
                    <SelectItem value="50s+">50대+</SelectItem>
                </SelectContent>
            </Select>
            <Select defaultValue="all">
                <SelectTrigger className="flex-1 rounded-xl">
                    <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">전국</SelectItem>
                    <SelectItem value="seoul">서울</SelectItem>
                    <SelectItem value="jeju">제주</SelectItem>
                    {/* ... regions */}
                </SelectContent>
            </Select>
        </div>

        <TabsContent value={period} className="mt-6 space-y-3">
          {MOCK_RANKING.map((user) => (
            <Card key={user.rank} className={`border-none ${user.rank <= 3 ? 'bg-indigo-50/50' : 'bg-white'} shadow-sm`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 flex justify-center text-xl font-black italic text-slate-400">
                  {user.rank === 1 ? <span className="text-yellow-500">🥇</span> : 
                   user.rank === 2 ? <span className="text-slate-400">🥈</span> : 
                   user.rank === 3 ? <span className="text-amber-600">🥉</span> : 
                   user.rank}
                </div>
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={user.photo} />
                  <AvatarFallback className="bg-slate-200 font-bold">{user.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{user.nickname}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-60">{user.ageGroup}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {user.region}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {user.time}s</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-600">{user.score.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PTS</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* 내 순위 하단 고정 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl">
        <Card className="bg-indigo-600 text-white border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
             <div className="w-8 flex justify-center text-xl font-black italic">128</div>
             <Avatar className="w-10 h-10 border-2 border-indigo-400">
                <AvatarFallback className="bg-indigo-500 font-bold text-white">나</AvatarFallback>
             </Avatar>
             <div className="flex-1">
                <span className="font-bold">내 순위</span>
                <p className="text-xs text-indigo-200">상위 12% 달성 중!</p>
             </div>
             <div className="text-right">
                <div className="text-lg font-black">2,450</div>
                <div className="text-[10px] font-bold opacity-70 tracking-widest uppercase">PTS</div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
