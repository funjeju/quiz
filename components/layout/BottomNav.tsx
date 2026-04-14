'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Trophy, User, Search } from 'lucide-react';

const NAV_ITEMS = [
  { label: '홈', href: '/dashboard', icon: Home },
  { label: '랭킹', href: '/ranking', icon: Trophy },
  { label: '검색', href: '/news', icon: Search },
  { label: '내 프로필', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // /quiz/play 에서는 하단 네비게이션 숨김
  if (pathname.includes('/quiz/') && !pathname.includes('/result')) return null;
  if (pathname.includes('/admin')) return null;
  if (pathname === '/login' || pathname === '/onboarding') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t pb-safe">
      <div className="container mx-auto max-w-2xl px-6 h-16 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
