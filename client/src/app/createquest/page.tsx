"use client";

import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

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

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.title) {
      alert("퀘스트 제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. API 호출 (자동으로 헤더에 토큰 들어감)
      // 이미지 업로드는 Day 5에 구현하므로 일단 null 전송
      const response = await api.post("/quest/create", formData);

      console.log("퀘스트 생성 완료:", response.data);
      
      // 2. 성공 시 목록 페이지로 이동 (또는 생성된 상세페이지)
      alert("퀘스트가 생성되었습니다!");
      router.push("/quests"); // 퀘스트 목록 페이지로 이동 (경로는 추후 조정)

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
          🏰 퀘스트 생성
        </h2>
      </div>

      {/* 2. 입력 폼 영역 */}
      <div className="space-y-6">
        
        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">퀘스트 제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 매일 팔굽혀펴기 50회"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
          />
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
          <div className="flex items-center justify-between">
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
          </div>

          {/* 기간 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">기간</label>
            <div className="relative w-32">
              <input
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                min={1}
                max={30}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-10 py-2 text-right font-bold text-gray-800 outline-none focus:border-yellow-400"
              />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">일</span>
            </div>
          </div>

          {/* 참가비 */}
          <div className="flex items-center justify-between">
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
          </div>

          {/* 최대 인원 */}
          <div className="flex items-center justify-between">
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
          </div>

        </div>

        {/* 3. 이미지 업로드 (UI만 구현 - Day 5 연동) */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">대표 이미지</label>
          <div className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100 hover:border-yellow-400">
            <div className="mb-2 rounded-full bg-gray-200 p-3 text-gray-500">
              📷
            </div>
            <p className="text-xs font-medium text-gray-500">이미지 업로드</p>
            {/* 실제 파일 input은 숨김 처리하거나 추후 구현 */}
            <input type="file" className="hidden" />
          </div>
        </div>

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
          {isLoading ? "생성 중..." : "퀘스트 만들기"}
        </button>
      </div>

    </div>
  );
}