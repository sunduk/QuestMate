"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useModalStore } from "../../store/useModalStore";
import LoginModal from "../LoginModal";
import UserAvatar from "../UserAvatar";
import AvatarSelectModal from "../AvatarSelectModal";
import MaskingTape from "../MaskingTape";

export default function TopBar() {
  const router = useRouter();
  const { token: storeToken, logout: storeLogout, user } = useAuthStore();
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useModalStore();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  
  // 스토어의 토큰 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!storeToken;

  // avatarNumber를 스토어 우선, 없으면 localStorage에서 읽도록 클라이언트에서 처리
  const [avatarNumberState, setAvatarNumberState] = useState<number>(user?.avatarNumber ?? 0);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

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
      if (typeof window !== "undefined") {
        setIsGuestMode(localStorage.getItem("isGuest") === "true");
      }
    } catch {}
  }, [storeToken, user]);

  // 클라이언트에서 localStorage에 저장된 avatarNumber를 읽어 상태에 반영
  useEffect(() => {
    try {
      if (user?.avatarNumber !== undefined && user?.avatarNumber !== null) {
        setAvatarNumberState(user.avatarNumber);
        return;
      }
      if (typeof window !== "undefined") {
        const v = Number(localStorage.getItem("avatarNumber"));
        if (!Number.isNaN(v)) setAvatarNumberState(v);
      }
    } catch {}
  }, [user]);

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

  const handleLogout = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    // 로그아웃 처리
    try {
      // 1. 스토어에서 토큰 가져오기
      const token = storeToken;

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
      // 5. 로컬 스토리지 및 스토어 정리 (token은 store.logout()이 자동 처리)
      localStorage.removeItem("userId");
      localStorage.removeItem("userExtraData");
      localStorage.setItem("isLoggedIn", "false");
      localStorage.setItem("isGuest", "false");
      storeLogout();

      // 4. 첫 페이지로 강제 이동
      router.replace("/"); 
    }
  }

  const handleExitGuestMode = () => {
    setIsExitModalOpen(false);
    handleLogout();
  }

  // Allow other parts of the app to trigger logout via a global event.
  // Dispatch with: `window.dispatchEvent(new Event('app:logout'))`.
  useEffect(() => {
    const onAppLogout = () => {
      try {
        handleLogout();
      } catch (e) {
        console.error('app:logout handler failed', e);
      }
    };

    window.addEventListener('app:logout', onAppLogout as EventListener);
    return () => window.removeEventListener('app:logout', onAppLogout as EventListener);
  }, [handleLogout]);

  return (
    <>
      {/* sticky top-0: 스크롤해도 상단에 고정 */}
      {/* z-50: 다른 요소보다 위에 표시 (레이어 순서) */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-center bg-[#fbf4e2] px-4 text-white shadow-md bg-cover bg-center bg-no-repeat"
        style={{  backgroundImage: "url('/title_bg.png')", backgroundSize: '100% 100%', borderBottom: "1px solid #e8ddc9" }}>

      {/* 왼쪽 */}
      {isGuestMode && (
      <div className="absolute left-4 rounded-full bg-slate-700 px-3 py-1">
        <span className="text-xl">체험중</span>
      </div>
      )}
      

      <div>
        <img src="/logo.png" alt="발자국 노트 로고" className="w-15 h-15 object-contain" />
      </div>

      <img src="/logo_title.png" alt="발자국 노트 타이틀 이미지" className="w-20 h-20 object-contain" />
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
                <UserAvatar avatarNumber={avatarNumberState} size={36} className="cursor-pointer hover:brightness-110" />
              </button>

              {/* 아바타 선택 모달 */}
              <AvatarSelectModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatarNumber={avatarNumberState}
              />
          </div>
          </div>
        )}
        
        <button 
          onClick={isGuestMode ? () => setIsExitModalOpen(true) : handleLogout}
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
      {isGuestMode && <MaskingTape />}

      {/* Exit confirmation modal (guest mode only) */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50" onClick={() => setIsExitModalOpen(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" 
            style={{ backgroundImage: "url('/popup_bg02.png')", backgroundSize: "cover" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex flex-col items-center gap-4">
              <img src="/exitdoor.png" alt="Exit" className="w-35 h-35 object-contain" />
              <h3 className="text-2xl font-bold text-[#4d2e14]">체험을 종료하시겠어요?</h3>
              <p className="text-sm text-[#5b432c] text-center">작성하신 노트는 저장되지 않고 사라집니다.<br />다시 돌아올 수 없어요.</p>

              <div className="mt-4 flex gap-3 w-full">
                <button onClick={() => setIsExitModalOpen(false)} 
                className="flex-1 h-10 rounded-full border border-gray-300 bg-[#d07e46] text-base text-[#ffffff] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                  // style={{ backgroundImage: "url('/form_button_noimage.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                >
                  <img src="/icon_check.png" alt="Close" className="inline-block mr-1 mb-1 w-5 object-contain" />계속 체험할래요
                </button>
                
                <button onClick={handleExitGuestMode} 
                  className="flex-1 h-10 rounded-full border border-gray-300 bg-[#f7f4eb] text-base text-[#47301f] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                >
                  <img src="/icon_x.png" alt="Close" className="inline-block mr-2 w-5 object-contain" />진짜 종료할래요
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    );
}