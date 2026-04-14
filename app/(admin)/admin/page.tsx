'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, FileText, BarChart3, Radio, RefreshCcw, Plus, Play, Info, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isAutoPilot, setIsAutoPilot] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setIsAutoPilot(json.config.isAutoPilotEnabled);
      }
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoPilot = async (checked: boolean) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAutoPilotEnabled: checked }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAutoPilot(checked);
        toast.success(`오토파일럿이 ${checked ? '활성화' : '비활성화'}되었습니다.`);
      }
    } catch (error) {
      toast.error('설정 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    totalUsers: 0,
    newUsersToday: 0,
    todayCollected: 0,
    todayQuizzes: 0,
    totalPlays: 0,
  };

  const logs = data?.logs || [];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            MoQuiz Admin Studio
            {loading && <RefreshCcw className="animate-spin text-slate-300" size={24} />}
          </h1>
          <p className="text-muted-foreground font-medium">실시간 서비스 운영 현황 및 관리</p>
        </div>
        
        <div className="flex items-center gap-6 bg-white p-3 px-5 rounded-2xl shadow-sm border">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pipeline Status</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black ${isAutoPilot ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isAutoPilot ? 'AUTOPILOT ON' : 'PAUSED'}
              </span>
              <Switch 
                checked={isAutoPilot} 
                onCheckedChange={toggleAutoPilot}
              />
            </div>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCcw className="mr-2" size={14} /> 새로고침
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="오늘 활성 사용자" value={stats.totalUsers} subValue={`오늘 +${stats.newUsersToday}`} icon={Users} color="text-blue-600" />
        <StatCard title="오늘 생성 퀴즈" value={stats.todayQuizzes} icon={FileText} color="text-indigo-600" />
        <StatCard title="오늘 수집 뉴스" value={stats.todayCollected} icon={Radio} color="text-emerald-600" />
        <StatCard title="전체 참여 수" value={stats.totalPlays} icon={BarChart3} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">최근 뉴스 수집 기록</CardTitle>
            <Link href="/admin/news">
              <Button variant="link" size="sm">전체 뉴스 보기</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold">날짜</TableHead>
                  <TableHead className="font-bold">지역</TableHead>
                  <TableHead className="font-bold text-center">수집량</TableHead>
                  <TableHead className="font-bold">상태</TableHead>
                  <TableHead className="text-right">시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400">수집 기록이 없습니다.</TableCell>
                  </TableRow>
                ) : logs.map((log: any) => (
                  <TableRow key={log.id} className="border-slate-50">
                    <TableCell className="font-medium text-slate-600">{log.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">{log.todayRegion}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">{log.totalCollected}</TableCell>
                    <TableCell>
                      <Badge className={log.totalCollected > 0 ? 'bg-emerald-500' : 'bg-slate-300'}>
                        {log.totalCollected > 0 ? 'SUCCESS' : 'EMPTY'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-400 tabular-nums text-xs">
                      {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-black">Quick Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ManagementButton icon={Radio} label="RSS 수동 수집" color="text-emerald-500" onClick={() => toast.info('개발 중인 기능입니다.')} />
            <ManagementButton icon={FileText} label="AI 퀴즈 일괄 생성" color="text-indigo-500" onClick={() => toast.info('개발 중인 기능입니다.')} />
            <ManagementButton icon={Trophy} label="랭킹 데이터 초기화" color="text-orange-500" onClick={() => toast.info('개발 중인 기능입니다.')} />
            
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
              <Link href="/admin/news">
                <Button className="w-full h-12 bg-slate-900 font-bold rounded-xl ring-offset-2 hover:ring-2 ring-slate-900 transition-all">
                  뉴스 스테이징 스튜디오
                </Button>
              </Link>
              <Link href="/admin/quiz">
                <Button variant="outline" className="w-full h-12 border-2 font-bold rounded-xl">
                  퀴즈 검수 및 발행
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
  return (
    <Card className="shadow-sm border-slate-200 hover:border-indigo-200 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-xl bg-slate-50 ${color}`}>
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-black text-slate-900 tabular-nums">{value.toLocaleString()}</div>
        {subValue && <p className="text-xs font-bold text-emerald-600 mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  );
}

function ManagementButton({ icon: Icon, label, color, onClick }: any) {
  return (
    <Button 
      variant="outline" 
      className="w-full justify-start h-14 text-md font-bold border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 rounded-2xl transition-all group"
      onClick={onClick}
    >
      <div className={`p-2 mr-3 rounded-xl bg-slate-50 group-hover:bg-white transition-colors ${color}`}>
        <Icon size={18} />
      </div>
      {label}
    </Button>
  );
}
