"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { isAxiosError } from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useModalStore } from "../../store/useModalStore";
import LoginModal from "../LoginModal";
import UserAvatar from "../UserAvatar";
import { AVATAR_ICONS } from "../../lib/avatarIcons";
import api from "../../lib/axios"; // 우리가 만든 Axios 인스턴스

export default function TopBar() {
  const router = useRouter();
  const { token: storeToken, logout: storeLogout, user, setAvatarNumber: setStoreAvatarNumber } = useAuthStore();
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useModalStore();
  
  // 스토어의 토큰 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!storeToken;

  // 스토어에서 avatarNumber 가져오기 (없으면 localStorage fallback)
  const avatarNumber = user?.avatarNumber ?? Number(localStorage.getItem("avatarNumber")) ?? 0;
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);

  // 모달 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarWrapperRef.current && !avatarWrapperRef.current.contains(event.target as Node)) {
        setIsAvatarModalOpen(false);
      }
    };

    if (isAvatarModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarModalOpen]);

  // 아바타 아이콘 목록 (공용)
  const avatarIcons = AVATAR_ICONS;

  const handleAvatarSelect = async (index: number) => {
    // 서버에 업데이트 (선택사항)
    try {
      // 1. API 호출 (자동으로 헤더에 토큰 들어감)
      const response = await api.post("/avatar/change", { avatarNumber: index });

      //console.log("퀘스트 생성 완료:", response.data);
      
      // 2. 성공 시 스토어와 localStorage 모두 업데이트 (다른 컴포넌트도 자동 갱신)
      localStorage.setItem("avatarNumber", index.toString());
      setStoreAvatarNumber(index);
    } catch (error) {
      console.error("생성 실패:", error);
      if (isAxiosError(error)) {
         alert(`생성 실패: ${error.response?.data?.error || "서버 오류"}`);
      } else {
         alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      // 3. 모달 닫기
      setIsAvatarModalOpen(false);
    }
  };

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
      storeLogout();

      // 4. 첫 페이지로 강제 이동
      router.replace("/"); 
    }
  }

  return (
    // sticky top-0: 스크롤해도 상단에 고정
    // z-50: 다른 요소보다 위에 표시 (레이어 순서)
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
              <button onClick={() => setIsAvatarModalOpen(!isAvatarModalOpen)}>
                <UserAvatar avatarNumber={avatarNumber} size={36} className="cursor-pointer hover:brightness-110" />
              </button>

              {/* 아바타 선택 모달 */}
              {isAvatarModalOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 bg-white border-2 border-[#e8ddc9] rounded-lg shadow-lg p-3 z-[60] max-h-90 overflow-y-auto"
                  style={{ width: '200px' }}
                >
                <h3 className="text-sm font-bold text-[#6e5238] mb-2">아바타 선택</h3>
                <div className="grid grid-cols-4 gap-2">
                  {avatarIcons.map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(index)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${
                        avatarNumber === index ? 'border-[#f59e0b]' : 'border-[#e8ddc9]'
                      } hover:border-[#f59e0b] transition`}
                    >
                      <img src={icon} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        )}
        
        <button 
          onClick={handleAuthAction}
          className="relative flex h-10 w-20 items-center justify-center transition active:scale-95 hover:brightness-110"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: isLoggedIn ? "url('/button_logout.png')" : "url('/button_login.png')", backgroundSize: '100% 100%' }}
          />
          <span className="relative z-10 text-[11px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
            {isLoggedIn ? "로그아웃" : "로그인"}
          </span>
        </button>
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} state={"/quests"} />
    </header>
  );
}