"use client";

import Link from "next/link";
import { useState } from "react";

// ----------------------------------------------------------------------
// [데이터 모델] 더미 데이터 구조 정의
// ----------------------------------------------------------------------
type Quest = {
  id: number;
  category: string; // 운동, 공부, 생활습관
  title: string;
  duration: string; // 3일, 1주일 등
  participants: string; // 현재인원/최대인원
  fee: number; // 참가비 (0이면 무료)
  icon: string; // 이모지로 대체
  color: string; // 아이콘 배경색
};

// [더미 데이터] 나중에는 서버 API에서 받아올 내용입니다.
const ALL_QUESTS: Quest[] = [
  { id: 1, category: "운동", title: "매일 스쿼트 50개", duration: "3일", participants: "3/4", fee: 0, icon: "🏋️", color: "bg-yellow-100" },
  { id: 2, category: "운동", title: "아침 조깅 인증", duration: "1주일", participants: "1/4", fee: 100, icon: "🏃", color: "bg-red-100" },
  { id: 3, category: "공부", title: "영단어 30개 암기", duration: "3일", participants: "3/4", fee: 100, icon: "📕", color: "bg-green-100" },
  { id: 4, category: "생활습관", title: "물 2L 마시기", duration: "3일", participants: "3/4", fee: 100, icon: "☕", color: "bg-slate-100" },
  { id: 5, category: "생활습관", title: "영양제 챙겨먹기", duration: "1주일", participants: "2/4", fee: 500, icon: "💊", color: "bg-blue-100" },
];

const CATEGORIES = ["전체", "운동", "공부", "생활습관"];

export default function QuestListPage() {
  // [State] 현재 선택된 탭 (기본값: 전체)
  const [activeTab, setActiveTab] = useState("전체");

  // [Logic] 선택된 탭에 따라 리스트 필터링
  // Unity의 List.Where()와 비슷합니다.
  const filteredQuests = activeTab === "전체" 
    ? ALL_QUESTS 
    : ALL_QUESTS.filter((q) => q.category === activeTab);

  return (
    <div className="relative flex min-h-full flex-col px-6 py-8">
      
      {/* 1. 페이지 타이틀 */}
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        퀘스트 게시판
      </h1>

      {/* 2. 카테고리 탭 (Filter Tabs) */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-colors
              ${
                activeTab === cat
                  ? "bg-slate-800 text-white shadow-md" // 선택됨
                  : "bg-white text-slate-500 hover:bg-slate-100" // 선택 안됨
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. 퀘스트 리스트 (Scroll View) */}
      <div className="flex flex-col gap-4 pb-24">
        {filteredQuests.map((quest) => (
          <Link href={`/quests/${quest.id}`} key={quest.id}>
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition active:scale-95 active:shadow-none">
              
              {/* 아이콘 박스 */}
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${quest.color}`}>
                {quest.icon}
              </div>

              {/* 텍스트 정보 */}
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-bold text-slate-800">{quest.title}</h3>
                <p className="text-xs text-slate-500">기간: {quest.duration}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  {/* 참가비가 있으면 표시, 없으면 무료 */}
                  {quest.fee > 0 ? (
                    <span className="text-yellow-600">💰 참가비 {quest.fee} G</span>
                  ) : (
                    <span className="text-green-600">🍀 무료 참여</span>
                  )}
                  <span className="text-slate-300">|</span>
                  <span>👥 {quest.participants}</span>
                </div>
              </div>

            </div>
          </Link>
        ))}

        {/* 리스트가 비었을 때 처리 */}
        {filteredQuests.length === 0 && (
          <div className="py-10 text-center text-slate-400">
            해당하는 퀘스트가 없습니다.<br />
            직접 만들어보세요!
          </div>
        )}
      </div>

      {/* 4. 플로팅 액션 버튼 (FAB) - 퀘스트 생성 */}
      {/* fixed positioned: 스크롤해도 우측 하단에 고정됨 */}
      <Link
        href="/quests/create"
        className="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-4xl text-slate-900 shadow-xl transition hover:scale-110 active:scale-90"
        style={{ 
          // 픽셀 아트 느낌을 위한 테두리 스타일 (선택사항)
          border: "4px solid #1e293b", // slate-800
          boxShadow: "4px 4px 0px 0px rgba(30, 41, 59, 0.5)" 
        }}
      >
        <span className="mb-1 ml-0.5">+</span>
      </Link>

    </div>
  );
}