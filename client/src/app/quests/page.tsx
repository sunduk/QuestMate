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
  hostUserVerificationCount: number; // 내 진행 상황
}

// B. 클라이언트 UI에서 사용할 구조 (ViewModel)
// -> 기존 더미 데이터 구조와 동일하게 유지
interface QuestViewModel {
  id: number;
  category: string; // "운동" (변환됨)
  title: string;
  duration: string; // "3일" (변환됨)
  durationDays: number; // 기간 (숫자)
  participants: string; // "1/4" (변환됨)
  fee: number;
  icon: string; // 매핑 필요
  color: string; // 매핑 필요
  hostUserVerificationCount: number; // 내 진행 상황
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
  isCompleted: boolean;
};

// [더미 데이터] 나중에는 서버 API에서 받아올 내용입니다.
const ALL_QUESTS: Quest[] = [
  { id: 1, category: "건강", title: "매일 스쿼트 50개", duration: "3일", participants: "3/4", fee: 0, icon: "/icon_health.png", color: "bg-yellow-100", isCompleted: false },
  { id: 2, category: "건강", title: "아침 조깅 인증", duration: "1주일", participants: "1/4", fee: 100, icon: "/icon_health.png", color: "bg-red-100", isCompleted: false },
  { id: 3, category: "공부", title: "영단어 30개 암기", duration: "3일", participants: "3/4", fee: 100, icon: "/icon_study.png", color: "bg-green-100", isCompleted: false },
  { id: 4, category: "생활", title: "물 2L 마시기", duration: "3일", participants: "3/4", fee: 100, icon: "/icon_living.png", color: "bg-slate-100", isCompleted: false },
  { id: 5, category: "생활", title: "영양제 챙겨먹기", duration: "1주일", participants: "2/4", fee: 500, icon: "/icon_living.png", color: "bg-blue-100", isCompleted: false },
];

const CATEGORIES = ["전체", "건강", "공부", "생활", "기타"];

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
          category: dto.category === 0 ? "건강" : dto.category === 1 ? "공부" : dto.category === 2 ? "생활" : "기타",
          duration: `${dto.durationDays}일`,
          durationDays: dto.durationDays,
          participants: `${dto.currentMemberCount}/${dto.maxMemberCount}`,
          
          // UI용 임시 데이터 (나중에 Category별로 자동 할당 로직 구현 필요)
          icon: dto.category === 0 ? "/icon_health.png" : dto.category === 1 ? "/icon_study.png" : dto.category === 2 ? "/icon_living.png" : "/icon_etc.png", 
          color: dto.category === 0 ? "bg-green-100" : dto.category === 1 ? "bg-blue-100" : "bg-yellow-100",
          hostUserVerificationCount: dto.hostUserVerificationCount
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

  // [Logic] 선택된 탭에 따라 리스트 필터링 후 완료 여부별 정렬
  const filteredQuests = (activeTab === "전체" 
    ? questList 
    : questList.filter((q) => q.category === activeTab))
    .sort((a, b) => {
      const aCompleted = a.hostUserVerificationCount >= a.durationDays;
      const bCompleted = b.hostUserVerificationCount >= b.durationDays;
      // 완료되지 않은 것을 먼저, 완료된 것을 나중에
      return Number(aCompleted) - Number(bCompleted);
    });


  return (
    <div 
      className="relative h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >


      {/* 2. 스크롤 영역: absolute inset-0 으로 꽉 채움 */}
      {/* 이렇게 하면 이 div만 독립적으로 스크롤됩니다. */}
      <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">

          {/* 1. 페이지 타이틀 */}
          <h1 className="mb-6 text-2xl font-bold text-[#5b3a1b] text-center">
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
            {filteredQuests.map((quest) => {
              // 완료 여부 계산: 내 진행 상황이 기간 이상이면 완료
              const isCompleted = quest.hostUserVerificationCount >= quest.durationDays;

              // 프로그레스.
              const progress = (quest.hostUserVerificationCount / quest.durationDays) * 100;
              
              return (
              <Link href={`/quests/${quest.id}`} key={quest.id}>
                <div 
                  className="flex items-center gap-4 rounded-2xl bg-cover bg-center bg-no-repeat p-3 transition active:scale-95 active:shadow-none"
                  style={{ backgroundImage: isCompleted ? "url('/questslot_bg_complted.png')" : "url('/questslot_bg.png')" }}
                >
                  
                  {/* 아이콘 박스 */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl">
                    <img src={quest.icon} alt={quest.category} className="h-14 w-14 object-contain" />
                    {isCompleted && (
                      <div 
                        className="absolute bg-cover bg-center bg-no-repeat h-19 w-19"
                        style={{ backgroundImage: "url('/quest_icon_gold_border_finish.png')" }}
                      />
                    )}
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className={`font-bold ${isCompleted ? "text-[#837363]" : "text-[#482d12]"}`}>{quest.title}</h3>
                    <p className="text-xs text-[#7c6a4a]">기간: {quest.duration}</p>

                    <div 
                      className="h-2.5 w-50 rounded-full bg-slate-100 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out bg-cover bg-center"
                        style={{ 
                          width: `${progress}%`,
                          backgroundImage: "url('/progress.png')"
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-[#7c6a4a]">
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
              );
            })}

            {/* 리스트가 비었을 때 처리 */}
            {filteredQuests.length === 0 && (
              <div className="py-10 text-center text-[#542b1a]">
                아직 남겨진 발자국이 없어요.<br />
                첫 발자국을 남겨보세요.

                <img src="/stamp.png" alt="Quest Mate Logo" className="mx-auto w-80 mt-4 opacity-50" />
              </div>
            )}
          </div>
      </div>

      {/* 4. 플로팅 액션 버튼 (FAB) - 업그레이드 버전 */}
      <Link
        href="/createquest"
        className="absolute bottom-20 right-6 z-40 group"
      >
        <img 
          src="/button_add_newnote.png" 
          alt="Add Quest" 
          className="h-16 w-16 transition-all duration-200 ease-out hover:-translate-y-1 active:translate-y-1"
        />
      </Link>
    </div>
  );
}