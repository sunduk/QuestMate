"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 임시 로그인 처리. 나중에 토큰/세션으로 교체.
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn != "false") {
      if (isLoggedIn) {
        router.push("/home");
      }
    }

  }, [router]);

  const handleJoin = () => {
    router.push("/join");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col items-center px-6 py-10">
      
      {/* 1. 로고 영역 */}
      <div className="mt-10 flex flex-col items-center gap-2">
        {/* 성 그림 대체 */}
        <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-300 text-2xl">
          🏰
        </div>
        <h1 className="text-center text-4xl font-black uppercase leading-tight text-slate-800 drop-shadow-sm">
          Quest Mate<br />
          <span className="text-yellow-500">Home</span>
        </h1>
      </div>

      {/* 2. 소셜 로그인 버튼 영역 */}
      <div className="mt-12 flex gap-4">
        {/* 구글 */}
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 transition hover:scale-110">
          <span className="font-bold text-blue-500">G</span>
        </button>
        {/* 네이버 */}
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-md transition hover:scale-110">
          <span className="font-bold text-white">N</span>
        </button>
        {/* 카카오 */}
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 shadow-md transition hover:scale-110">
          <span className="font-bold text-amber-900">Talk</span>
        </button>
      </div>

      <div className="flex w-full flex-col items-center gap-3 mt-8">
        
        {/* 1. 로그인 (Primary: 골드/오렌지 - 접속/시작 느낌) */}
        <button 
          onClick={handleLogin}
          className="w-full max-w-xs rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-xl font-bold text-white shadow-lg shadow-orange-500/30 transition active:scale-95 active:shadow-none"
        >
          로그인
        </button>

        {/* 2. 회원가입 (Secondary: 인디고/퍼플 - 신비로운/생성 느낌) */}
        <button 
          onClick={handleJoin}
          className="w-full max-w-xs rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-xl font-bold text-white shadow-lg shadow-indigo-500/30 transition active:scale-95 active:shadow-none"
        >
          회원가입
        </button>

      </div>

      {/* 4. 데코레이션 (캐릭터들) */}
      <div className="mt-12 grid w-full grid-cols-3 gap-4 opacity-80">
        {/* 캐릭터 placeholder 6개 */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-12 w-12 animate-bounce rounded bg-slate-300 shadow-sm duration-[2000ms]" style={{ animationDelay: `${i * 100}ms` }}></div>
          </div>
        ))}
      </div>
      
    </div>
  );
}