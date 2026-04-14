'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface KakaoShareButtonProps {
  score: number;
  rank: number;
  quizSetId: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export function KakaoShareButton({ score, rank, quizSetId }: KakaoShareButtonProps) {
  useEffect(() => {
    // Kakao SDK 로드
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
        } catch (e) {
          console.error('Kakao init error:', e);
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      // SDK가 없거나 초기화되지 않은 경우 클립보드 복사로 대체
      const shareUrl = `${window.location.origin}/quiz/${quizSetId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 클립보드에 복사되었습니다!');
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `🧠 모두의퀴즈 — ${score.toLocaleString()}점 달성!`,
        description: `전체 ${rank}위 달성! 나보다 잘 풀 수 있어? 🏆`,
        imageUrl: `${window.location.origin}/og-image.png`,
        link: {
          mobileWebUrl: `${window.location.origin}/quiz/${quizSetId}`,
          webUrl: `${window.location.origin}/quiz/${quizSetId}`,
        },
      },
      buttons: [
        {
          title: '퀴즈 풀기',
          link: {
            mobileWebUrl: `${window.location.origin}/quiz/${quizSetId}`,
            webUrl: `${window.location.origin}/quiz/${quizSetId}`,
          },
        },
      ],
    });
  };

  return (
    <Button 
      className="w-full h-14 text-lg font-bold bg-[#FEE500] text-[#191919] hover:bg-[#FADA0A] rounded-2xl shadow-lg border-none"
      onClick={handleShare}
    >
      <Share2 className="mr-2" size={20} />
      카카오톡으로 자랑하기
    </Button>
  );
}
