import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function MobileFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 바깥 배경: 회색 (PC 화면용)
    <div className="flex min-h-screen justify-center bg-gray-100">
      {/* 모바일 컨테이너: 최대 너비 448px(max-w-md), 세로 꽉 채움, 흰색 배경 */}
      <div className="relative flex h-full min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-2xl">
        
        {/* 1. 상단 바 (고정) */}
        <TopBar />

        {/* 2. 메인 컨텐츠 (스크롤 가능 영역) */}
        {/* flex-1: 남은 공간 다 차지, pb-20: 하단 바에 가려지지 않게 여백 */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* 3. 하단 메뉴 (고정) */}
        <BottomNav />
        
      </div>
    </div>
  );
}