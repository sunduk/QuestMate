import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function MobileFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 바깥 배경: 회색 (PC 화면용)
    // 1. 바깥 배경: 스크롤 방지 (overflow-hidden)
    <div className="flex h-screen w-full justify-center bg-gray-100 overflow-hidden">

      {/* 2. 모바일 컨테이너: h-full (부모 높이 100% 고정) */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-slate-50 shadow-2xl">
        
        {/* 1. 상단 바 (고정) */}
        <TopBar />

        {/* 2. 메인 컨텐츠 */}
        <main className="flex-1 relative overflow-y-auto">
          {children}
        </main>

        {/* 3. 하단 메뉴 (고정) */}
        <BottomNav />
        
      </div>
    </div>
  );
}