"use client";

import React from "react";

const MaskingTape: React.FC = () => {
  return (
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
  );
};

export default MaskingTape;
