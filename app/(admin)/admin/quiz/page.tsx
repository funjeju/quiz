'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AGE_GROUP_LABELS, AgeGroup } from '@/types';
import { RefreshCcw, CheckCircle2, AlertCircle, Edit3, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function QuizVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    ageGroup: 'all',
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ageGroup: filter.ageGroup,
        limit: '30',
      });
      const res = await fetch(`/api/admin/quiz?${params}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions);
      }
    } catch (error) {
      toast.error('퀴즈 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filter.ageGroup]);

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">퀴즈 검수 및 발행</h1>
          <p className="text-muted-foreground font-medium">AI가 생성한 문제를 검토하고 품질을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
            <Select 
                value={filter.ageGroup} 
                onValueChange={(v) => setFilter({...filter, ageGroup: v})}
            >
              <SelectTrigger className="w-[150px] h-12 rounded-xl border-2">
                <SelectValue placeholder="연령대" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 연령대</SelectItem>
                {Object.entries(AGE_GROUP_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchQuestions} variant="outline" className="h-12 px-6 rounded-xl border-2">
              <RefreshCcw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} /> 새로고침
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-slate-50 border-none shadow-none" />
          ))
        ) : questions.length === 0 ? (
          <div className="col-span-full h-80 flex items-center justify-center text-slate-400 font-bold">
            표시할 퀴즈가 없습니다.
          </div>
        ) : questions.map((q) => (
          <Card key={q.id} className="shadow-sm border-slate-200 overflow-hidden group hover:border-indigo-300 transition-all flex flex-col">
            <CardHeader className="bg-slate-50/50 pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">
                  {AGE_GROUP_LABELS[q.ageGroup as AgeGroup] || '전체'}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600">
                    <Edit3 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg font-bold leading-tight line-clamp-2 min-h-[3.5rem]">
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 flex-1">
              <div className="space-y-2">
                {q.options?.map((opt: string, i: number) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl text-sm font-medium border-2 ${
                      opt === q.correctAnswer 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-slate-100 text-center text-[10px] leading-5 mr-3 font-bold">
                      {i + 1}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
                   <AlertCircle size={14} /> AI 해설
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{q.explanation}"
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                   <Eye size={12} /> {q.articleTitle.substring(0, 15)}...
                </div>
                <Button variant="link" className="text-indigo-600 font-bold text-xs p-0 h-auto">
                   문제 상세보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
