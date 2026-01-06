"use client";

import Image from "next/image";
import { AVATAR_ICONS, getAvatarPath } from "../lib/avatarIcons";

interface UserAvatarProps {
  avatarNumber?: number;
  size?: number;
  className?: string;
}

export default function UserAvatar({ avatarNumber = 0, size = 40, className = "" }: UserAvatarProps) {
  const avatarPath = getAvatarPath(avatarNumber);

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-[#fefce8] border-2 border-[#e8ddc9] ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={avatarPath} 
        alt="User Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
