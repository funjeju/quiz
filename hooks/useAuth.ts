import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useAuthStore } from '@/stores/authStore';
import { UserProfile } from '@/types';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Firestore에서 사용자 프로필 정보 가져오기
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
        } else {
          // 신규 사용자 기초 프로필 생성
          const newProfile: Partial<UserProfile> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'user',
            totalPoints: 0,
            profileCompleted: false,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            stats: {
              totalQuizzes: 0,
              totalCorrect: 0,
              avgScore: 0,
              streakDays: 0,
              lastPlayDate: '',
              badges: [],
            },
          };
          // 이 시점에서는 setDoc을 하지 않고, 온보딩 완료 시 저장함
          // 단, 세션 관리를 위해 store에는 임시 저장
          setUser(newProfile as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, loading };
}
