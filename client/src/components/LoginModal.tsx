"use client";

import { baseURL } from "../lib/axios";
import api from "../lib/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { handleLoginSuccess } from "../lib/authHelpers";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: string;
}

export default function LoginModal({ isOpen, onClose, state }: LoginModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  if (!isOpen) return null;

  const handleNaverLogin = () => {
    window.location.href = baseURL + "/naverlogin";
  };

  const handleKakaoLogin = () => {
    window.location.href = baseURL + "/kakaologin";
  };

  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "openid email profile";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `state=${encodeURIComponent(state)}`;

    window.location.href = googleAuthUrl;
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const resp = await api.post("/auth/guest");
      await handleLoginSuccess(resp.data, setAuth, router, state);
      onClose();
    } catch (err: unknown) {
      console.error("Guest login failed", err);
      alert("게스트 로그인에 실패했습니다.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm animate-in fade-in zoom-in duration-300 rounded-3xl bg-[#fbf3e0] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <div className="mb-4 text-5xl">
            <img src="/login_logo.png" alt="Login Logo" className="mx-auto w-50" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-800">로그인이 필요해요</h3>
          <p className="text-sm text-gray-500">
            노트를 만들려면 로그인해주세요
          </p>
        </div>

        <div className="space-y-3">
          {/* 구글 로그인 */}
          <button
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-700 font-medium shadow-sm transition hover:bg-gray-50 active:scale-95"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>구글로 시작하기</span>
          </button>

          <button
            onClick={handleKakaoLogin}
            disabled={isGuestLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#FEE500] py-3 px-4 text-[#000000] font-medium shadow-sm transition hover:bg-[#FDD835] active:scale-95"
          >
            <span>카카오로 시작하기</span>
          </button>

          {/* 네이버 로그인 */}
          <button
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#03C75A] py-3 px-4 text-white font-medium shadow-sm transition hover:bg-[#02B350] active:scale-95"
            onClick={handleNaverLogin}
          >
            <span>네이버로 시작하기</span>
          </button>
        </div>

        {/* Divider + guest button */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            // UI-only: no click handler (no functionality)
            className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-100 py-3 px-4 text-gray-700 font-medium shadow-sm transition hover:bg-gray-50 active:scale-95"
            onClick={handleGuestLogin}
            disabled={isGuestLoading}
          >
            <img src="/stamp.png" alt="Guest Icon" className="w-8 h-8" />
            <span className="text-lg text-[#724b20] tracking-tight drop-shadow-sm mt-1">
              로그인 없이 체험하기
            </span>
          </button>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-gray-300 py-3 text-gray-600 font-medium transition hover:bg-gray-400 active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
