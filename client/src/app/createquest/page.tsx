"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import api, { baseURL } from "../../lib/axios"; // 우리가 만든 Axios 인스턴스
import { isAxiosError } from "axios";
import { useAuthStore } from "../../store/useAuthStore";

import googleStyles from "../google.module.css";

// 카테고리 매핑 (서버: 0=운동, 1=공부, 2=생활, 3=기타 가정)
const CATEGORIES = [
  { id: 0, label: "운동", icon: "/icon_health.png" },
  { id: 1, label: "공부", icon: "/icon_study.png" },
  { id: 2, label: "생활", icon: "/icon_living.png" },
  { id: 3, label: "기타", icon: "/icon_etc.png" },
];

export default function CreateQuestPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();
  const isLoggedIn = !!token;
  
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // DTO 구조에 맞춘 State
  const [formData, setFormData] = useState({
    title: "",
    category: 0,
    targetCount: 1,
    durationDays: 3,
    entryFee: 0,
    maxMemberCount: 4,
    imageUrl: null as string | null, // Day 5에 구현 예정
  });

  const handleNaverLogin = () => {
      window.location.href = baseURL + "/naverlogin";
    }

    const handleKakaoLogin = () => {
      window.location.href = baseURL + "/kakaologin";
    }

    const handleGoogleLogin = () => {
      // 1. 구글 OAuth URL 생성 (인가코드를 받기 위해)
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "openid email profile";
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(googleClientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline`;
      
      // 2. 구글 로그인 페이지로 리다이렉트 (인가코드를 받기 위해)
      window.location.href = googleAuthUrl;
    }

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "title") {
      setTitleError(false);
    }

    // 숫자로 변환해야 하는 필드들 처리
    const isNumberField = ["targetCount", "durationDays", "entryFee", "maxMemberCount"].includes(name);
    
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? Number(value) : value,
    }));
  };

  // Input 필드 포커스 핸들러
  const handleInputFocus = () => {
    if (!isLoggedIn) {
      // remove input filed focus.
      titleRef.current?.blur();
      
      setShowLoginModal(true);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (catId: number) => {
    setFormData((prev) => ({ ...prev, category: catId }));
  };

  // 기간 변경 핸들러
  const handleDurationChange = (days: number) => {
    setFormData((prev) => ({ ...prev, durationDays: days }));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    // 로그인 체크
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!formData.title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      // 1. API 호출 (자동으로 헤더에 토큰 들어감)
      // 이미지 업로드는 Day 5에 구현하므로 일단 null 전송
      const response = await api.post("/quest/create", formData);

      //console.log("퀘스트 생성 완료:", response.data);
      
      // 2. 성공 시 모달 표시
      setShowSuccessModal(true);

    } catch (error) {
      console.error("생성 실패:", error);
      if (isAxiosError(error)) {
         alert(`생성 실패: ${error.response?.data?.error || "서버 오류"}`);
      } else {
         alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative flex min-h-full flex-col px-6 py-8 pb-24 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      
      {/* 1. 타이틀 영역 */}
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-[#472c13] tracking-tight drop-shadow-sm mt-1">
          노트 만들기
        </h2>
        <div className="mt-2 text-center text-sm text-gray-600">
          <img src="/icon_lock.png" alt="Lock Icon" className="inline-block mr-1 w-4 h-5" />
          쉿, 나만 볼 수 있어요. 비공개로 저장됩니다.
        </div>
      </div>

      {/* 2. 입력 폼 영역 */}
      <div className="space-y-6">
        
        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4d2d12]">이번 며칠 동안 남기고 싶은 것</label>
          <input
            ref={titleRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onFocus={handleInputFocus}
            placeholder="예: 매일 아침 5분 글쓰기"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition 
              ${titleError 
                ? "border-[#472c13] bg-[#faf3cd] focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 bg-gray-50 focus:border-yellow-400 focus:bg-white focus:ring-1 focus:ring-[#8c7866]"
              }
            `}
          />
          {titleError && (
            <p className="mt-1 text-xs font-medium text-[#8c3b25]">제목을 입력해 주세요</p>
          )}
        </div>

        {/* 카테고리 (탭 스타일) */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">카테고리</label>
          <div className="flex w-full gap-2 rounded-xl p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-1 rounded-lg w-15 h-15 py-2 text-sm font-bold transition-all duration-200 border
                  ${formData.category === cat.id 
                    ? "bg-[#aeca9f] border-1 border-[#839878] text-white shadow-md transform scale-105" // 선택됨 (이미지의 초록색)
                    : "text-gray-500 bg-[#fdfbf0] hover:bg-[#f6f2dd] border-gray-200"
                  }
                `}
              >
                <img src={cat.icon} alt={cat.label} className="inline-block mr-1 w-10 h-10" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 숫자 입력 필드들 */}
        <div className="space-y-4">
          
          {/* 목표 횟수 */}
          {/* <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">목표 횟수</label>
            <div className="relative w-32">
              <input
                type="number"
                name="targetCount"
                value={formData.targetCount}
                onChange={handleChange}
                min={1}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-10 py-2 text-right font-bold text-gray-800 outline-none focus:border-yellow-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">회</span>
            </div>
          </div> */}

          {/* 기간 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">기간</label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDurationChange(day)}
                  className={`rounded-xl py-2 text-sm font-bold transition-all duration-200 border
                    ${formData.durationDays === day 
                      ? "bg-[#aeca9f] text-white border-[#839878] shadow-md" 
                      : "bg-[#fdfbf0] text-gray-500 border-gray-200 hover:bg-[#f6f2dd]"
                    }
                  `}
                >
                  {day}일
                </button>
              ))}
            </div>
          </div>

          {/* 참가비 */}
          {/* <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">참가비</label>
            <div className="relative w-32">
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                min={0}
                step={100}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-10 py-2 text-right font-bold text-gray-800 outline-none focus:border-yellow-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">G</span>
            </div>
          </div> */}

          {/* 최대 인원 */}
          {/* <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">최대 인원</label>
            <div className="relative w-32">
              <input
                type="number"
                name="maxMemberCount"
                value={formData.maxMemberCount}
                onChange={handleChange}
                min={2}
                max={10}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-10 py-2 text-right font-bold text-gray-800 outline-none focus:border-yellow-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">명</span>
            </div>
          </div> */}

        </div>

        {/* 3. 이미지 업로드 (UI만 구현 - Day 5 연동) */}
        {/* <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">대표 이미지</label>
          <div className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100 hover:border-yellow-400">
            <div className="mb-2 rounded-full bg-gray-200 p-3 text-gray-500">
              📷
            </div>
            <p className="text-xs font-medium text-gray-500">이미지 업로드</p>
            <input type="file" className="hidden" />
          </div>
        </div> */}

      </div>

      {/* 4. 하단 버튼 */}
      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full rounded-full py-4 text-xl font-bold text-[#5a3e24] shadow-lg transition active:scale-95 bg-cover bg-center bg-no-repeat border-none`}
          style={{ backgroundImage: "url('/button_write_blank.png')" }}
        >
          {isLoading ? "생성 중..." : `${formData.durationDays}일 노트 시작하기`}
        </button>

        <div className="mt-10 text-center text-sm text-gray-500">
          {"완벽하지 않아도 괜찮아요."}
          <br />
          {"남기는 것만으로 충분합니다."}
        </div>
      </div>

      {/* 5. 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300 rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-800">목표 생성 완료</h3>
            <p className="mb-8 text-gray-500">
              새로운 목표가 생성되었습니다.<br />
              지금 바로 확인해보세요!
            </p>
            <button
              onClick={() => router.push("/quests")}
              className="w-full rounded-xl bg-yellow-500 py-4 text-lg font-bold text-white shadow-lg shadow-yellow-500/30 transition active:scale-95 hover:bg-yellow-600"
            >
              확인하러 가기
            </button>
          </div>
        </div>
      )}

      {/* 6. 로그인 모달 */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            className="w-full max-w-sm animate-in fade-in zoom-in duration-300 rounded-3xl bg-[#fbf3e0] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl"><img src="/login_logo.png" alt="Login Logo" className="mx-auto" /></div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800">로그인이 필요해요</h3>
              <p className="text-sm text-gray-500">
                노트를 만들려면 로그인해주세요
              </p>
            </div>

            <div className="space-y-3">
              {/* 구글 로그인 */}
              <button
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-700 font-medium shadow-sm transition hover:bg-gray-50 active:scale-95"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>구글로 시작하기</span>
              </button>

              {/* 카카오 로그인 */}
              <button
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#FEE500] py-3 px-4 text-[#000000] font-medium shadow-sm transition hover:bg-[#FDD835] active:scale-95"
                onClick={handleKakaoLogin}
              >
                {/* <img src="/icon_kakao.png" alt="Kakao" className="w-6 h-6" /> */}
                <span>카카오로 시작하기</span>
              </button>

              {/* 네이버 로그인 */}
              <button
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#03C75A] py-3 px-4 text-white font-medium shadow-sm transition hover:bg-[#02B350] active:scale-95"
                onClick={handleNaverLogin}
              >
                {/* <img src="/naver/icon_naver.png" alt="Naver" className="w-6 h-6" /> */}
                <span>네이버로 시작하기</span>
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-6 w-full rounded-xl bg-gray-300 py-3 text-gray-600 font-medium transition hover:bg-gray-400 active:scale-95"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}