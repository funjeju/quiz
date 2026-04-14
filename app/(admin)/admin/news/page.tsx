'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, CategoryType } from '@/types';
import { Search, RefreshCcw, ExternalLink, PlayCircle, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsStagingPage() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    category: 'all',
    search: '',
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: filter.category,
        limit: '50',
      });
      const res = await fetch(`/api/admin/news?${params}`);
      const json = await res.json();
      if (json.success) {
        setNews(json.news);
      }
    } catch (error) {
      toast.error('뉴스 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filter.category]);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(filter.search.toLowerCase()) ||
    item.source.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">뉴스 스테이징 스튜디오</h1>
          <p className="text-muted-foreground font-medium">수집된 뉴스를 검토하고 퀴즈 생성 상태를 관리합니다.</p>
        </div>
        <Button onClick={fetchNews} variant="outline" className="h-12 px-6 rounded-xl border-2">
          <RefreshCcw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} /> 새로고침
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 lg:p-4">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="제목 또는 출처 검색..." 
                className="pl-10 h-10 rounded-xl"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <Select 
                value={filter.category} 
                onValueChange={(v) => setFilter({...filter, category: v})}
            >
              <SelectTrigger className="w-[180px] h-10 rounded-xl">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-bold text-slate-400">
            총 {filteredNews.length}개의 기사
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[450px] font-bold">기사 제목</TableHead>
                <TableHead className="font-bold">카테고리</TableHead>
                <TableHead className="font-bold">출처</TableHead>
                <TableHead className="font-bold text-center">퀴즈 생성</TableHead>
                <TableHead className="text-right font-bold">수집일</TableHead>
                <TableHead className="text-right font-bold">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                   <TableRow key={i}>
                     <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50/50"></TableCell>
                   </TableRow>
                ))
              ) : filteredNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400">데이터가 없습니다.</TableCell>
                </TableRow>
              ) : filteredNews.map((item) => (
                <TableRow key={item.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-bold text-slate-700 leading-snug">
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-2">{item.title}</span>
                      <div className="flex items-center gap-2">
                         <a href={item.originalUrl} target="_blank" className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1">
                           원문보기 <ExternalLink size={10} />
                         </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold px-3">{CATEGORY_LABELS[item.category as CategoryType]}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium">{item.source}</TableCell>
                  <TableCell className="text-center">
                    {item.quizGenerated ? (
                      <div className="flex items-center justify-center text-emerald-500 gap-1 font-bold text-xs">
                        <CheckCircle2 size={16} /> 생성됨
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-slate-300 gap-1 font-bold text-xs">
                        <Clock size={16} /> 대기중
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-sm tabular-nums">
                    {new Date(item.collectedAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-indigo-600 hover:bg-indigo-50">
                      <PlayCircle size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
