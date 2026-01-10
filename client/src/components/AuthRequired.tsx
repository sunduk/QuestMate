import React from "react";

export const AuthRequired: React.FC<{ message?: string }> = ({ message = "로그인 필요" }) => {
  return (
    <div 
      className="relative h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
      >

        {/* 2. 스크롤 영역: absolute inset-0 으로 꽉 채움 */}
        {/* 이렇게 하면 이 div만 독립적으로 스크롤됩니다. */}
        <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">

            {/* 1. 페이지 타이틀 */}
            <h1 className="mt-3 mb-6 text-2xl font-bold text-[#5b3a1b] text-center">
            로그인이 필요합니다.
            </h1>
        </div>

        <div className="py-10 text-center text-[#542b1a]">
            <img src="/icon_lock.png" alt="Quest Mate Logo" className="mx-auto w-30 mt-40 opacity-50" />
        </div>
    </div>
  );
};

export default AuthRequired;
