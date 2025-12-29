"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 임시 로그인 처리. 나중에 토큰/세션으로 교체.
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      router.push("/home");
    }
  }, [router]);

  const handleLogin = () => {
    // 서버 인증은 나중에
    localStorage.setItem("isLoggedIn", "true");
    router.replace("/home");
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

      {/* 3. CTA 버튼 (모험 시작하기) */}
      <button className="mt-8 w-full max-w-xs rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95 active:shadow-none"
        onClick={handleLogin}>
        모험 시작하기
      </button>

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