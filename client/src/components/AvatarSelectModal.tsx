"use client";

import { AVATAR_ICONS } from "../lib/avatarIcons";
import api from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { isAxiosError } from "axios";

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarNumber: number;
  className?: string;
}

export default function AvatarSelectModal({ 
  isOpen, 
  onClose, 
  currentAvatarNumber,
  className = ""
}: AvatarSelectModalProps) {
  const { setAvatarNumber: setStoreAvatarNumber } = useAuthStore();
  const avatarIcons = AVATAR_ICONS;

  const handleAvatarSelect = async (index: number) => {
    try {
      // 1. API 호출 (자동으로 헤더에 토큰 들어감)
      await api.post("/avatar/change", { avatarNumber: index });

      // 2. 성공 시 스토어와 localStorage 모두 업데이트 (다른 컴포넌트도 자동 갱신)
      localStorage.setItem("avatarNumber", index.toString());
      setStoreAvatarNumber(index);
      
      // notify other components
      window.dispatchEvent(new Event('user:update'));
    } catch (error) {
      console.error("아바타 변경 실패:", error);
      if (isAxiosError(error)) {
        alert(`변경 실패: ${error.response?.data?.error || "서버 오류"}`);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      // 3. 모달 닫기
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute top-full right-0 mt-2 bg-white border-2 border-[#e8ddc9] rounded-lg shadow-lg p-3 z-[60] max-h-90 overflow-y-auto ${className}`}
      style={{ width: '200px' }}
    >
      <h3 className="text-sm font-bold text-[#6e5238] mb-2">아바타 선택</h3>
      <div className="grid grid-cols-4 gap-2">
        {avatarIcons.map((icon, index) => (
          <button
            key={index}
            onClick={() => handleAvatarSelect(index)}
            className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${
              currentAvatarNumber === index ? 'border-[#f59e0b]' : 'border-[#e8ddc9]'
            } hover:border-[#f59e0b] transition`}
          >
            <img src={icon} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
