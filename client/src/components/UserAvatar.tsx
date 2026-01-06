"use client";

import Image from "next/image";

interface UserAvatarProps {
  avatarNumber?: number;
  size?: number;
  className?: string;
}

const getAvatarPath = (avatarNumber: number) => {
  const icons = [
    "/usericon/type03_calendar01.png",
    "/usericon/type03_default01.png",
    "/usericon/type03_default02.png",
    "/usericon/type03_default04.png",
    "/usericon/type03_footprint.png",
    "/usericon/type03_footprint02.png",
    "/usericon/type03_pencil01.png",
    "/usericon/type03_footprint02.png",
    "/usericon/girl.png", 
    "/usericon/kid.png",
    "/usericon/type02_baby_smile.png",
    "/usericon/type02_baby_surprise.png",
    "/usericon/type02_baby02_idle.png",
    "/usericon/type02_baby03_idle.png",
    "/usericon/type02_baby04_idle.png",
    "/usericon/type02_bear_angry.png",
    "/usericon/type02_bear_sleepy.png",
    "/usericon/type02_bear_smile.png",
    "/usericon/type02_cat_angry.png",
    "/usericon/type02_cat_idle.png",
    "/usericon/type02_cat_smile.png",
    "/usericon/type02_cat02_angry.png",
    "/usericon/type02_cat02_idle.png",
    "/usericon/type02_cat02_sleepy.png",
    "/usericon/type02_doci_sleepy.png",
    "/usericon/type02_doci_smile.png",
    "/usericon/type02_doci_surprise.png",
    "/usericon/type02_dog_smile.png",
    "/usericon/type02_dog_wink.png",
    "/usericon/type02_girl_angry.png",
    "/usericon/type02_girl_cry.png",
    "/usericon/type02_girl_smile.png",
    "/usericon/type02_leap_blue.png",
    "/usericon/type02_leap_red.png",
    "/usericon/type02_leap_yellow.png",
    "/usericon/type02_penguin_angry.png",
    "/usericon/type02_penguin_sleepy.png",
    "/usericon/type02_penguin_smile.png",
    "/usericon/type02_rose01_blue.png",
    "/usericon/type02_rose01_red.png",
    "/usericon/type02_rose01_yellow.png"
  ];
  
  return icons[avatarNumber] || icons[0];
};

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
