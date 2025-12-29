"use client";

import Link from "next/link";

export default function BottomNav() {
  const menus = [
    { name: "홈", icon: "🏠", active: true, href:"/" },
    { name: "퀘스트 찾기", icon: "📜", active: false, href:"/quests" },
    { name: "상점", icon: "🛒", active: false, href:"/shop" },
    { name: "내 방", icon: "🪑", active: false, href:"/myroom" },
  ];

  return (
    // fixed bottom-0: 화면 하단에 무조건 고정
    <nav className="fixed bottom-0 z-50 flex h-16 w-full max-w-md items-center justify-around border-t border-slate-700 bg-slate-800 text-slate-400">
      {menus.map((menu) => (
        <Link href={menu.href} key={menu.name}
          className={`flex flex-col items-center gap-1 ${
            menu.active ? "text-yellow-400" : "hover:text-slate-200"
          }`}
        >
          <span className="text-xl">{menu.icon}</span>
          <span className="text-xs font-medium">{menu.name}</span>
        </Link>
      ))}
    </nav>
  );
}