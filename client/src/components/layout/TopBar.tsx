"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useModalStore } from "../../store/useModalStore";
import LoginModal from "../LoginModal";
import UserAvatar from "../UserAvatar";
import AvatarSelectModal from "../AvatarSelectModal";

export default function TopBar() {
  const router = useRouter();
  const { token: storeToken, logout: storeLogout, user } = useAuthStore();
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useModalStore();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("isGuest") === "true";
    } catch {
      return false;
    }
  });
  
  // 스토어의 토큰 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!storeToken;

  // 스토어에서 avatarNumber 가져오기 (없으면 localStorage fallback)
  const avatarNumber = user?.avatarNumber ?? Number(localStorage.getItem("avatarNumber")) ?? 0;
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);

  // 모달 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // if click is inside avatar button or inside portal modal, do nothing
      if (avatarWrapperRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('.avatar-select-modal-portal')) return;

      setIsAvatarModalOpen(false);
    };

    if (isAvatarModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarModalOpen]);

  // Keep guest mode state in sync with localStorage and auth changes
  useEffect(() => {
    try {
      setIsGuestMode(localStorage.getItem("isGuest") === "true");
    } catch {}
  }, [storeToken, user]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "isGuest") {
        setIsGuestMode(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Listen for same-tab guest mode changes via CustomEvent
  useEffect(() => {
    const onGuestEvent = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        setIsGuestMode(!!detail);
      } catch {
        try {
          setIsGuestMode(localStorage.getItem("isGuest") === "true");
        } catch {}
      }
    };
    window.addEventListener('guest-mode-changed', onGuestEvent as EventListener);
    return () => window.removeEventListener('guest-mode-changed', onGuestEvent as EventListener);
  }, []);

  const handleAuthAction = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    // 로그아웃 처리
    try {
      // 1. 로컬 스토리지에서 토큰 꺼내기
      const token = localStorage.getItem("accessToken") || storeToken;

      if (!token) {
        storeLogout();
        localStorage.setItem("isLoggedIn", "false");
        router.replace("/");
        return;
      }

      // 2. 로그아웃 요청
      await axios.post(
        "https://localhost:7173/api/auth/logout", 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // 5. 로컬 스토리지 및 스토어 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userExtraData");
      localStorage.setItem("isLoggedIn", "false");
      localStorage.setItem("isGuest", "false");
      storeLogout();

      // 4. 첫 페이지로 강제 이동
      router.replace("/"); 
    }
  }

  return (
    <>
      {/* sticky top-0: 스크롤해도 상단에 고정 */}
      {/* z-50: 다른 요소보다 위에 표시 (레이어 순서) */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-center bg-[#fbf4e2] px-4 text-white shadow-md bg-cover bg-center bg-no-repeat"
        style={{  backgroundImage: "url('/title_bg.png')", backgroundSize: '100% 100%', borderBottom: "1px solid #e8ddc9" }}>
      {/* 왼쪽: 골드 현황 */}
      {/* <div className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1">
        <span className="text-xl">💰</span>
        <span className="font-bold text-yellow-400">999,999 G</span>
        <img src="/logo.png" alt="화살표" className="w-4 h-4 object-contain" />
      </div>
       */}
      <div>
        <img src="/logo.png" alt="화살표" className="w-15 h-15 object-contain" />
      </div>

      <img src="/logo_title.png" alt="화살표" className="w-20 h-20 object-contain" />
      {/* <h1 className="text-xl font-black text-[#6e5238] text-center">발자국 노트</h1> */}

      {/* 오른쪽: 알림, 설정 */}
      <div className="absolute right-4 flex gap-2 items-center">
        {/* <button className="text-xl hover:text-yellow-400">🔔</button>
        <button className="text-xl hover:text-yellow-400">⚙️</button> */}
        
        {/* 유저 아이콘 (로그인 시에만 표시) */}
        {isLoggedIn && (
          <div className="relative">
            <div ref={avatarWrapperRef}>
              <button onClick={() => router.push("/setting")}>
                <UserAvatar avatarNumber={avatarNumber} size={36} className="cursor-pointer hover:brightness-110" />
              </button>

              {/* 아바타 선택 모달 */}
              <AvatarSelectModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatarNumber={avatarNumber}
              />
          </div>
          </div>
        )}
        
        <button 
          onClick={handleAuthAction}
          className="relative flex h-10 w-23 items-center justify-center transition active:scale-95 hover:brightness-110"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: isLoggedIn ? "url('/button_logout.png')" : "url('/button_login.png')", backgroundSize: '100% 100%' }}
          />
          <span className="relative z-10 text-[13px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
            {isLoggedIn ? (isGuestMode ? "체험 종료" : "로그아웃") : "로그인"}
          </span>
          {/* <img src="/exit.png" alt="화살표" className="absolute right-2 w-8 h-8 object-contain" /> */}
        </button>
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} state={"/quests"} />
      </header>

      {/* masking tape 이미지 영역 - 게스트 모드일 때만 배경 위에 겹쳐서 표시 (레이아웃 공간 차지 안함) */}
      {isGuestMode && (
        <div className="fixed top-9 left-0 right-0 z-60 w-full h-16 flex justify-center pointer-events-none">
          <div className="relative w-full max-w-screen-md flex justify-center" style={{ transform: "rotate(-5deg)" }}>
            <img src="/masking_tape.png" alt="masking tape" className="w-full object-contain opacity-75" />
            
            <div className="absolute mb-5 inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-[#724b20] drop-shadow-[0_3px_3px_rgba(0,0,0,0.25)] select-none">지금은 체험 여행 중이에요</span>
            </div>

            <div className="absolute mt-6 inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm text-[#6c3d11] select-none">(체험 종료시 노트가 사라집니다)</span>
            </div>
          </div>
        </div>
      )}
    </>
    );
}