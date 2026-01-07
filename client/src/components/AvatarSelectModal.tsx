"use client";

import { AVATAR_ICONS } from "../lib/avatarIcons";
import api from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { isAxiosError } from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from 'next/image';

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarNumber: number;
  className?: string;
  // optional anchor ref to position the modal via portal (avoids clipping by overflow)
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export default function AvatarSelectModal({ 
  isOpen, 
  onClose, 
  currentAvatarNumber,
  className = "",
  anchorRef,
}: AvatarSelectModalProps) {
  const { setAvatarNumber: setStoreAvatarNumber } = useAuthStore();
  const avatarIcons = AVATAR_ICONS;
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // useLayoutEffect ensures the coordinates are calculated before paint,
  // preventing a visible flicker when the modal opens.
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      setCoords(null);
      return;
    }

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const width = 200; // modal width
      // Position the modal so its top-left is directly below the anchor's left edge.
      // Clamp to viewport with 8px padding so it doesn't overflow off-screen.
      const rawLeft = rect.left + window.scrollX;
      const maxLeft = window.scrollX + window.innerWidth - width - 8;
      const left = Math.min(Math.max(8 + window.scrollX, rawLeft), maxLeft);
      const top = rect.bottom + window.scrollY + 8;
      setCoords({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, anchorRef]);

  const handleAvatarSelect = async (index: number) => {
    try {
      await api.post("/avatar/change", { avatarNumber: index });
      localStorage.setItem("avatarNumber", index.toString());
      setStoreAvatarNumber(index);
      window.dispatchEvent(new Event('user:update'));
    } catch (error) {
      console.error("아바타 변경 실패:", error);
      if (isAxiosError(error)) {
        alert(`변경 실패: ${error.response?.data?.error || "서버 오류"}`);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className={`bg-white border-2 border-[#e8ddc9] rounded-lg shadow-lg p-3 z-[9999] max-h-200 overflow-y-auto ${className}`}
      style={{ width: 250 }}
    >
      <h3 className="text-sm font-bold text-[#6e5238] mb-2">아바타 선택</h3>
      <div className="grid grid-cols-5 gap-2">
        {avatarIcons.map((icon, index) => (
          <button
            key={index}
            onClick={() => handleAvatarSelect(index)}
            className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${
              currentAvatarNumber === index ? 'border-[#f59e0b]' : 'border-[#e8ddc9]'
            } hover:border-[#f59e0b] transition`}
          >
            <Image src={icon} alt={`Avatar ${index}`} width={40} height={40} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );

  // If anchorRef provided and coords calculated, render via portal at absolute page coords
  if (anchorRef && coords) {
    return createPortal(
      <div style={{ position: 'absolute', top: coords.top, left: coords.left, zIndex: 9999 }}>
        {modal}
      </div>,
      document.body
    );
  }

  // fallback: render inline
  return (
    <div 
      className={`absolute top-full right-0 mt-2 bg-white border-2 border-[#e8ddc9] rounded-lg shadow-lg p-3 z-[60] max-h-90 overflow-y-auto ${className}`}
      style={{ width: '200px' }}
    >
      {modal}
    </div>
  );
}
