'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Radio, FileText, Users, BarChart3, Settings } from 'lucide-react';

const MENU_ITEMS = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '뉴스 관리', href: '/admin/news', icon: Radio },
  { label: '퀴즈 관리', href: '/admin/quiz', icon: FileText },
  { label: '사용자 관리', href: '/admin/users', icon: Users },
  { label: '랭킹/통계', href: '/admin/ranking', icon: BarChart3 },
  { label: '시스템 설정', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col gap-8">
      <div className="px-4 py-2">
        <h2 className="text-2xl font-black text-indigo-400">MoQuiz Admin</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
        v1.0.0 © 2026 MoQuiz
      </div>
    </aside>
  );
}
