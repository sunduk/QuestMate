"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import api from "../../lib/axios"; // 우리가 만든 Axios 인스턴스
import { isAxiosError } from "axios";

// 카테고리 매핑 (서버: 0=운동, 1=공부, 2=생활, 3=기타 가정)
const CATEGORIES = [
  { id: 0, label: "운동", icon: "💪" },
  { id: 1, label: "공부", icon: "📚" },
  { id: 2, label: "생활", icon: "🌱" },
  { id: 3, label: "기타", icon: "🎸" },
];

export default function CreateQuestPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    <div className="relative flex min-h-full flex-col px-6 py-8 pb-24">
      
      {/* 1. 타이틀 영역 */}
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-yellow-500 tracking-tight drop-shadow-sm mt-1">
          기록 만들기
        </h2>
      </div>

      {/* 2. 입력 폼 영역 */}
      <div className="space-y-6">
        
        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">이번 며칠 동안 남기고 싶은 것</label>
          <input
            ref={titleRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 매일 아침 5분 글쓰기"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition 
              ${titleError 
                ? "border-red-200 bg-red-50 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 bg-gray-50 focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
              }
            `}
          />
          {titleError && (
            <p className="mt-1 text-xs font-medium text-red-500">제목을 입력해 주세요</p>
          )}
        </div>

        {/* 카테고리 (탭 스타일) */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">카테고리</label>
          <div className="flex w-full gap-2 rounded-xl bg-gray-100 p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all duration-200
                  ${formData.category === cat.id 
                    ? "bg-green-500 text-white shadow-md transform scale-105" // 선택됨 (이미지의 초록색)
                    : "text-gray-500 hover:bg-gray-200"
                  }
                `}
              >
                <span className="mr-1">{cat.icon}</span>
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
                      ? "bg-yellow-500 text-white border-yellow-500 shadow-md" 
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
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
          className={`w-full rounded-xl py-4 text-xl font-bold text-white shadow-lg transition active:scale-95
            ${isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-yellow-500/30"
            }
          `}
        >
          {isLoading ? "생성 중..." : `${formData.durationDays}일 기록 시작하기`}
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

    </div>
  );
}