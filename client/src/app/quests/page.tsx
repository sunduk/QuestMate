"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "../../lib/axios"; // 우리가 만든 Axios 인스턴스

// ----------------------------------------------------------------------
// [데이터 모델] 더미 데이터 구조 정의
// ----------------------------------------------------------------------
// A. 서버에서 날아오는 원본 패킷 구조 (DTO)
interface QuestItemDto {
  id: number;
  title: string;
  category: number; // 0:운동, 1:공부...
  durationDays: number;
  entryFee: number;
  currentMemberCount: number;
  maxMemberCount: number;
  imageUrl: string | null;
  status: number;
}

// B. 클라이언트 UI에서 사용할 구조 (ViewModel)
// -> 기존 더미 데이터 구조와 동일하게 유지
interface QuestViewModel {
  id: number;
  category: string; // "운동" (변환됨)
  title: string;
  duration: string; // "3일" (변환됨)
  participants: string; // "1/4" (변환됨)
  fee: number;
  icon: string; // 매핑 필요
  color: string; // 매핑 필요
}




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
  { id: 6, category: "생활습관", title: "영양제 챙겨먹기", duration: "1주일", participants: "2/4", fee: 500, icon: "💊", color: "bg-blue-100" },
  { id: 7, category: "생활습관", title: "영양제 챙겨먹기", duration: "1주일", participants: "2/4", fee: 500, icon: "💊", color: "bg-blue-100" },
  { id: 8, category: "생활습관", title: "영양제 챙겨먹기", duration: "1주일", participants: "2/4", fee: 500, icon: "💊", color: "bg-blue-100" },
];

const CATEGORIES = ["전체", "운동", "공부", "생활습관"];

export default function QuestListPage() {
  // [State] 퀘스트 리스트 (서버에서 받아온 데이터)
  const [questList, setQuestList] = useState<QuestViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // [State] 현재 선택된 탭 (기본값: 전체)
  const [activeTab, setActiveTab] = useState("전체");

  // [Effect] 페이지 로드 시(OnStart) API 호출
  useEffect(() => {
    fetchQuestList();
  }, []);

  const fetchQuestList = async () => {
    try {
      setIsLoading(true);
      
      // 1. API 요청 (GET /api/quest)
      const response = await api.get("/quest/list");
      const { success, items } = response.data; // QuestListResultDto

      if (success && items) {
        // 2. 데이터 파싱 (Server DTO -> Client ViewModel)
        // 게임에서 패킷 받아서 캐릭터 객체 만드는 과정과 동일
        const parsedList: QuestViewModel[] = items.map((dto: QuestItemDto) => ({
          id: dto.id,
          title: dto.title,
          fee: dto.entryFee,
          
          // 단순 변환 로직 (나중에 유틸 함수로 빼면 좋음)
          category: dto.category === 0 ? "운동" : dto.category === 1 ? "공부" : "생활습관",
          duration: `${dto.durationDays}일`,
          participants: `${dto.currentMemberCount}/${dto.maxMemberCount}`,
          
          // UI용 임시 데이터 (나중에 Category별로 자동 할당 로직 구현 필요)
          icon: dto.category === 0 ? "💪" : dto.category === 1 ? "📚" : "🌱", 
          color: dto.category === 0 ? "bg-green-100" : dto.category === 1 ? "bg-blue-100" : "bg-yellow-100"
        }));

        setQuestList(parsedList);
      } else {
        console.error("데이터 로드 실패:", response.data.error);
      }

    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // [Logic] 선택된 탭에 따라 리스트 필터링
  const filteredQuests = activeTab === "전체" 
    ? questList 
    : questList.filter((q) => q.category === activeTab);


  return (
    <div className="relative h-full w-full">


      {/* 2. 스크롤 영역: absolute inset-0 으로 꽉 채움 */}
      {/* 이렇게 하면 이 div만 독립적으로 스크롤됩니다. */}
      <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">

          {/* 1. 페이지 타이틀 */}
          <h1 className="mb-6 text-2xl font-bold text-slate-800">
            하루가 쌓여 나를 만듭니다
          </h1>

          {/* 2. 카테고리 탭 (Filter Tabs) */}
          {/* <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
          </div> */}

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
                      {/* {quest.fee > 0 ? (
                        <span className="text-yellow-600">💰 참가비 {quest.fee} G</span>
                      ) : (
                        <span className="text-green-600">🍀 무료 참여</span>
                      )} */}
                      {/* <span className="text-slate-300">|</span> */}
                      {/* <span>👥 {quest.participants}</span> */}
                    </div>
                  </div>

                </div>
              </Link>
            ))}

            {/* 리스트가 비었을 때 처리 */}
            {filteredQuests.length === 0 && (
              <div className="py-10 text-center text-slate-400">
                아직 남겨진 하루가 없어요.<br />
                첫 하루를 남겨보세요.
              </div>
            )}
          </div>
      </div>

      {/* 4. 플로팅 액션 버튼 (FAB) - 업그레이드 버전 */}
      <Link
        href="/createquest"
        className="absolute bottom-20 right-6 z-40 group"
      >
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-900 transition-all duration-200 ease-out hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none active:brightness-95"
          style={{ 
            // 외곽선
            border: "1px solid #d8a90fff", // slate-800
            // 쉐도우
            boxShadow: "4px 4px 0px 0px #bdc0c7ff" 
          }}
        >
          {/* 텍스트 '+' 대신 SVG 아이콘 사용 (완벽한 중앙 정렬 및 두께감) */}
          <PlusIcon className="w-8 h-8 stroke-[3px]" />
        </div>
      </Link>
    </div>
  );

  // SVG 아이콘 컴포넌트 (파일 하단에 붙여넣기)
  function PlusIcon({ className }: { className?: string }) {
    return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    );
  }
}