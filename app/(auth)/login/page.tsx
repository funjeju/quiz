'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast.success('로그인 성공!');
        router.push('/onboarding');
      }
    } catch (error) {
      console.error(error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">모두의퀴즈</CardTitle>
          <CardDescription className="text-balance text-muted-foreground">
            매일 새로운 뉴스를 퀴즈로 즐겨보세요!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-8">
          <Button 
            variant="outline" 
            className="h-14 w-full gap-2 text-lg font-semibold bg-white hover:bg-slate-50 border-slate-200" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-1" />
            )}
            Google로 계속하기
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>지식과 재미를 동시에, MoQuiz</p>
          <p className="text-xs">로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
