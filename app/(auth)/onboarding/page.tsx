'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AgeGroup, Gender } from '@/types';

const REGIONS = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'incheon', label: '인천' },
  { value: 'gwangju', label: '광주' },
  { value: 'daejeon', label: '대전' },
  { value: 'ulsan', label: '울산' },
  { value: 'sejong', label: '세종' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'gangwon', label: '강원' },
  { value: 'chungbuk', label: '충북' },
  { value: 'chungnam', label: '충남' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeonnam', label: '전남' },
  { value: 'gyeongbuk', label: '경북' },
  { value: 'gyeongnam', label: '경남' },
  { value: 'jeju', label: '제주' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nickname: user?.displayName || '',
    gender: '' as Gender,
    ageGroup: '' as AgeGroup,
    region: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.nickname || !formData.gender || !formData.ageGroup || !formData.region) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedProfile = {
        ...user,
        nickname: formData.nickname,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        region: formData.region,
        profileCompleted: true,
        lastLoginAt: new Date(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, updatedProfile);
      setUser(updatedProfile as any);
      toast.success('반갑습니다! 프로필 설정이 완료되었습니다.');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">프로필 설정</CardTitle>
          <CardDescription>
            맞춤형 퀴즈를 위해 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input 
                id="nickname" 
                placeholder="사용할 닉네임을 입력하세요" 
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">성별</Label>
                <Select onValueChange={(v) => setFormData({...formData, gender: v as Gender})}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">연령대</Label>
                <Select onValueChange={(v) => setFormData({...formData, ageGroup: v as AgeGroup})}>
                  <SelectTrigger id="ageGroup">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10대</SelectItem>
                    <SelectItem value="20s">20대</SelectItem>
                    <SelectItem value="30s">30대</SelectItem>
                    <SelectItem value="40s">40대</SelectItem>
                    <SelectItem value="50s+">50대+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">지역</Label>
              <Select onValueChange={(v) => setFormData({...formData, region: v})}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="주로 활동하는 지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((reg) => (
                    <SelectItem key={reg.value} value={reg.value}>{reg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? '가입 중...' : '모두의퀴즈 시작하기'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
