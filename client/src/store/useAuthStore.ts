import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 새로고침 해도 데이터 유지해주는 미들웨어

interface User {
  id: number;
  email: string;
  nickname: string;
  avatarNumber?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  
  // 액션들
  setAuth: (user: User, token: string) => void;
  setAvatarNumber: (avatarNumber: number) => void;
  logout: () => void;
}

// create<AuthState>() 뒤에 persist를 감싸면 LocalStorage에 자동 저장됩니다.
// PlayerPrefs 자동 저장 기능이라고 보시면 됩니다.
export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      token: null,

      // 로그인 성공 시 호출
      setAuth: (user, token) => set({ user, token }),

      // 아바타 번호 업데이트
      setAvatarNumber: (avatarNumber: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, avatarNumber } });
        }
      },

      // 로그아웃 시 호출
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // LocalStorage에 저장될 키 이름
    }
  )
);