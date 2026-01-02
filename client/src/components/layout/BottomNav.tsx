"use client";

import Link from "next/link";

export default function BottomNav() {
  const menus = [
    { name: "홈", icon: <img src="/button_home.png" alt="홈" className="w-12 h-12 object-contain" />, active: true, href:"/" },
    { name: "기록 만들기", icon: <img src="/button_menu_write.png" alt="기록 만들기" className="w-12 h-12 object-contain" />, active: false, href:"/quests" },
    { name: "문의 사항", icon: <img src="/button_menu_question.png" alt="문의 사항" className="w-12 h-12 object-contain" />, active: false, href:"/shop" },
    // { name: "상점", icon: "🛒", active: false, href:"/shop" },
    // { name: "내 방", icon: "🪑", active: false, href:"/myroom" },
  ];

  return (
    // fixed bottom-0: 화면 하단에 무조건 고정
    <nav className="fixed bottom-0 z-50 flex h-16 w-full max-w-md items-center justify-around border-t border-[#e8ddc9] bg-[#f9f1dc] text-[#482e17]">
      {menus.map((menu) => (
        <Link href={menu.href} key={menu.name}
          className={`flex flex-col items-center ${
            menu.active ? "text-[#6e472a]" : "hover:text-[#67553f]"
          }`}
        >
          <span className="flex items-center justify-center">{menu.icon}</span>
          <span className="text-xs font-medium">{menu.name}</span>
        </Link>
      ))}
    </nav>
  );
}