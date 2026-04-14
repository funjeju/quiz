'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, FileText, BarChart3, Radio, RefreshCcw, Plus } from 'lucide-react';

const STATS = [
  { title: '오늘 활성 사용자', value: '1,280', icon: Users, color: 'text-blue-600' },
  { title: '오늘 생성 퀴즈', value: '110', icon: FileText, color: 'text-indigo-600' },
  { title: '오늘 수집 뉴스', value: '254', icon: Radio, color: 'text-emerald-600' },
  { title: '전체 참여 수', value: '45,201', icon: BarChart3, color: 'text-orange-600' },
];

const RECENT_COLLECTION = [
  { category: '연예', count: 25, status: 'success', time: '06:01' },
  { category: '시사', count: 28, status: 'success', time: '06:02' },
  { category: 'K팝', count: 22, status: 'partial', time: '06:05' },
  { category: 'AI', count: 25, status: 'success', time: '06:08' },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">어드민 대시보드</h1>
          <p className="text-muted-foreground font-medium">서비스 운영 현황 및 관리</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><RefreshCcw className="mr-2" size={16} /> 새로고침</Button>
            <Button className="bg-indigo-600"><Plus className="mr-2" size={16} /> 공지사항 등록</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon size={20} className={stat.color} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">최근 뉴스 수집 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리</TableHead>
                  <TableHead>수집 수</TableHead>
                  <TableHead>시간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_COLLECTION.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-bold">{item.category}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'success' ? 'default' : 'destructive'} className="rounded-full">
                        {item.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">자세히</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">빠른 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start h-12 text-md font-bold border-2">
                <Radio className="mr-3 text-emerald-600" size={20} /> RSS 수동 수집
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-md font-bold border-2">
                <FileText className="mr-3 text-indigo-600" size={20} /> AI 퀴즈 일괄 생성
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-md font-bold border-2">
                <Users className="mr-3 text-blue-600" size={20} /> 사용자 제재 관리
            </Button>
            <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase">시스템 상태</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Gemini 1.5 Flash Connected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Firebase Firestore Healthy</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
