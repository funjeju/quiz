import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Radio } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600 text-white shadow-xl animate-bounce">
            <Radio size={48} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
            모두의<span className="text-indigo-600">퀴즈</span>
          </h1>
          <p className="max-w-md mx-auto text-lg md:text-xl text-slate-600 font-medium">
            매일 쏟아지는 뉴스를 재미있는 퀴즈로!<br />
            당신의 시사 상식을 테스트하고 랭킹에 도전하세요.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/login" className="flex-1">
            <Button className="w-full h-16 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg">
              지금 시작하기
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-4 rounded-full bg-white shadow-sm text-indigo-500">
              <Zap size={24} />
            </div>
            <h3 className="font-bold">AI 퀴즈 생성</h3>
            <p className="text-sm text-slate-500">최신 기사를 AI가 퀴즈로 자동 변환</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-4 rounded-full bg-white shadow-sm text-yellow-500">
              <Trophy size={24} />
            </div>
            <h3 className="font-bold">실시간 랭킹</h3>
            <p className="text-sm text-slate-500">전국 사용자들과 겨루는 실시간 순위</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-4 rounded-full bg-white shadow-sm text-emerald-500">
              <UsersIcon size={24} />
            </div>
            <h3 className="font-bold">맞춤형 연령대</h3>
            <p className="text-sm text-slate-500">10대부터 50대까지 세대별 맞춤 문제</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-400 text-xs font-medium border-t bg-white">
        © 2026 MoQuiz Team. Powered by Gemini AI.
      </footer>
    </div>
  );
}

function UsersIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
