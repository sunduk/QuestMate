"use client";

import { useRouter } from "next/navigation";

export default function TopBar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.replace("/");
  }

  return (
    // sticky top-0: 스크롤해도 상단에 고정
    // z-50: 다른 요소보다 위에 표시 (레이어 순서)
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-slate-800 px-4 text-white shadow-md">
      {/* 왼쪽: 골드 현황 */}
      <div className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1">
        <span className="text-xl">💰</span>
        <span className="font-bold text-yellow-400">999,999 G</span>
      </div>

      {/* 오른쪽: 알림, 설정 */}
      <div className="flex gap-4">
        <button className="text-xl hover:text-yellow-400">🔔</button>
        <button className="text-xl hover:text-yellow-400">⚙️</button>
        <button 
          onClick={handleLogout}
          className="text-xl hover:text-yellow-400"
        >
          🚪
        </button>
      </div>
    </header>
  );
}