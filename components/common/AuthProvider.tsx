'use client';

import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useAuth 훅을 여기서 호출하여 전역적으로 Firebase Auth 상태를 Zustand store와 동기화합니다.
  useAuth();
  
  return <>{children}</>;
}
