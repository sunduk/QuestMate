"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 임시 로그인 처리. 나중에 토큰/세션으로 교체.
    // const isLoggedIn = localStorage.getItem("isLoggedIn");
    // if (isLoggedIn != "false") {
    //   if (isLoggedIn) {
    //     router.push("/home");
    //   }
    // }

  }, [router]);

  const handleCreateQuest = () => {
    router.push("/createquest");
  };

  // 마우스 휠 스크롤 처리 (부드럽게)
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      e.preventDefault();
      const scrollAmount = e.deltaY * 0.5; // 스크롤 양을 절반으로 줄여서 더 부드럽게
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 마우스 드래그 스크롤 처리 (부드러운 드래그 및 관성 추가)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    const slider = scrollRef.current;
    const startX = e.pageX - slider.offsetLeft;
    const initialScrollLeft = slider.scrollLeft;
    
    let velocity = 0;
    let lastX = e.pageX;
    let targetScrollLeft = initialScrollLeft;
    let currentScrollLeft = initialScrollLeft;
    let isDragging = true;

    // 드래그 시작 시 스냅 및 부드러운 스크롤 끄기 (즉각적인 반응을 위해)
    slider.style.scrollSnapType = 'none';
    slider.style.scrollBehavior = 'auto';

    const update = () => {
      if (!isDragging && Math.abs(velocity) < 0.1) {
        // 드래그 종료 및 관성 이동 완료 후 다시 스냅 활성화
        slider.style.scrollSnapType = 'x proximity';
        slider.style.scrollBehavior = 'smooth';
        return;
      }

      // 부드러운 이동을 위한 보간 (Lerp)
      // 현재 위치에서 목표 위치로 20%씩 이동하여 부드러운 느낌 제공
      currentScrollLeft += (targetScrollLeft - currentScrollLeft) * 0.2;
      slider.scrollLeft = currentScrollLeft;

      if (!isDragging) {
        // 마우스를 뗐을 때 관성 적용
        targetScrollLeft -= velocity;
        velocity *= 0.95; // 감속
      }

      if (isDragging || Math.abs(velocity) >= 0.1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.2; // 감도 약간 조정
      targetScrollLeft = initialScrollLeft - walk;
      
      velocity = e.pageX - lastX;
      lastX = e.pageX;
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      slider.style.cursor = 'grab';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    slider.style.cursor = 'grabbing';
  };

  const handleJoin = () => {
    router.push("/join");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center px-2 py-2 pb-20"
      style={{ backgroundImage: "url('/home_bg.png')" }}>

      {/* 1. 메인 로고 (공통) */}
      <div className="mb-2 flex flex-col items-center gap-1">
        <img src="/title_img.png" alt="Quest Mate Logo" className="h-60 w-60 object-contain" />
      </div>

      <h1 className="mb-6 text-xl font-bold text-[#5b3a1b] text-center text-shadow-md">
        사진 한 장과 글 한 줄<br />
        나만의 비밀 발자국을 남겨보세요
      </h1>

      {/* 가로 슬라이드 이미지 */}
      <div className="mb-0 w-full bg-[#bd8c61]/20 backdrop-blur-sm py-6 rounded-2xl shadow-inner border-y border-white/30">
        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className="flex gap-4 overflow-x-auto snap-x snap-proximity px-4 pb-2 cursor-grab select-none [&::-webkit-scrollbar]:hidden"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth'
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={num} className="flex-shrink-0 snap-center">
              <img 
                src={`/home_preview_0${num}.png`} 
                alt={`Preview ${num}`} 
                className="w-75 h-70 object-cover rounded-xl shadow-md border border-slate-300 pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. 하단 버튼 */}
      <div className="mt-8 mb-12 w-full flex justify-center">
        <button
          onClick={handleCreateQuest}
          className={`w-90 rounded-full py-4 text-xl font-bold text-[#f0dedb] text-shadow-md text-shadow-[#5b3a1b] shadow-xl transition active:scale-95 bg-cover bg-center bg-no-repeat shadow-amber-900/50`}
          style={{ backgroundImage: "url('/button_write_blank_footprint.png')" }}
        >
          {"발자국 노트 만들러 가기"}
        </button>
      </div>


      {/* 가로 세줄로 표현 */}
      {/* <div className="grid grid-cols-3 gap-2 mb-12">
        <div className="relative">
          <img src="/home_card_01.png" alt="Home Card" className="h-30 w-30 object-contain" />
          <div className="absolute bottom-0 left-6 bottom-3 transform text-sm font-medium text-[#5b3a1b]">
            나의 발자국
          </div>
        </div>
        <div className="relative">
          <img src="/home_card_02.png" alt="Home Card" className="h-30 w-30 object-contain" />
          <div className="absolute bottom-0 left-8 bottom-3 transform text-sm font-medium text-[#5b3a1b]">
            비밀 노트
          </div>
        </div>
        <div className="relative">
          <img src="/home_card_03.png" alt="Home Card" className="h-30 w-30 object-contain" />
          <div className="absolute bottom-0 left-5 bottom-3 transform text-sm font-medium text-[#5b3a1b]">
            한주간의 변화
          </div>
        </div>
      </div> */}
    </div>
  );
}