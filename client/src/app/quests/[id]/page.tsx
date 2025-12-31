"use client";

import React, { use, useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../store/useAuthStore"; // 내 ID 확인용
import { useRouter } from "next/navigation";

// ----------------------------------------------------------------------
// [타입 정의]
// ----------------------------------------------------------------------

// 1. 서버에서 오는 데이터 (DTO)
interface QuestParticipantDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isHost: boolean;
  currentCount: number;
}

interface QuestDetailDto {
  id: number;
  title: string;
  category: number;
  targetCount: number;
  durationDays: number;
  entryFee: number;
  maxMemberCount: number;
  currentMemberCount: number;
  status: number;
  isJoined: boolean;
  participants: QuestParticipantDto[];
}

// 2. 클라이언트 UI 모델 (ViewModel)
interface QuestViewModel {
  id: number;
  title: string;
  description: string; // DB에 없으므로 생성
  icon: string;        // Category 매핑
  targetCount: number;
  entryFee: number;
  isJoined: boolean;
  participants: {
    userId: number;
    name: string;
    avatar: string;
    current: number;
    isMe: boolean;
  }[];
}

interface QuestDetailPageProps {
  params: Promise<{ id: string }>;
}

// ----------------------------------------------------------------------
// [컴포넌트]
// ----------------------------------------------------------------------
export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  // 로그인한 내 정보 (참여자 중 '나'를 찾기 위해 필요)
  const { user } = useAuthStore(); 

  const [quest, setQuest] = useState<QuestViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        // GET 요청
        const response = await api.get(`/quest/${id}`);
        const result = response.data; // QuestDetailResultDto

        if (result.success && result.data) {
          const data: QuestDetailDto = result.data;

          // [Data Mapping] Server DTO -> Client ViewModel
          const mappedQuest: QuestViewModel = {
            id: data.id,
            title: data.title,
            // DB에 설명 필드가 없으므로, 제목과 기간을 조합해 생성
            description: `${data.durationDays}일 동안 진행되는 퀘스트입니다. 목표를 달성하고 보상을 획득하세요!`,
            targetCount: data.targetCount,
            entryFee: data.entryFee,
            isJoined: data.isJoined,
            // 카테고리별 아이콘 매핑
            icon: data.category === 0 ? "🏋️" : data.category === 1 ? "📚" : "🌱",
            
            // 참여자 매핑
            participants: data.participants.map((p) => ({
              userId: p.userId,
              name: p.nickname || `유저 ${p.userId}`,
              // 아바타가 없으면 임의의 이모지 부여 (나중에 실제 이미지로 교체)
              avatar: p.profileImageUrl || getRandomAvatar(p.userId), 
              current: p.currentCount,
              // Zustand에 저장된 내 ID와 비교하여 '나' 식별
              isMe: user ? user.id === p.userId : false, 
            })),
          };

          setQuest(mappedQuest);
        } else {
          setError(result.error || "퀘스트 정보를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error(err);
        setError("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, user]);

  // 임시 아바타 생성기 (유저 ID 기반)
  const getRandomAvatar = (uid: number) => {
    const emojis = ["🧑‍🦰", "🧟‍♂️", "👨", "🐤", "🐶", "🐱"];
    return emojis[uid % emojis.length];
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="text-gray-500 animate-pulse">로딩 중... 🔄</span>
      </div>
    );
  }

  // 에러 화면
  if (error || !quest) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 gap-4">
        <span className="text-red-500">{error || "존재하지 않는 퀘스트입니다."}</span>
        <button onClick={() => router.back()} className="text-blue-500 underline">뒤로가기</button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-50">
      
      {/* 스크롤 영역 */}
      <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">
        
        {/* 상단 타이틀 & 아이콘 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md text-5xl border-2 border-gray-100">
            {quest.icon}
          </div>
          <h1 className="text-2xl font-black text-slate-800 text-center">
            {quest.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500 text-center px-4 break-keep">
            {quest.description}
          </p>
        </div>

        {/* 메인 카드 (참여자 현황) */}
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              참여자 현황 <span className="text-slate-400 text-sm font-normal">({quest.participants.length}/4)</span>
            </h2>
          </div>

          {/* 참여자 리스트 */}
          <div className="flex flex-col gap-4">
            {quest.participants.map((p, index) => {
              // 진행률 계산
              const progress = Math.min(100, Math.max(0, (p.current / quest.targetCount) * 100));
              const isCompleted = p.current >= quest.targetCount;

              return (
                <div key={index} className="flex items-center gap-3">
                  
                  {/* 아바타 */}
                  <div className="relative">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm border-2 
                      ${p.isMe ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-100"}`}
                    >
                      {p.avatar}
                    </div>
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ring-2 ring-white">
                        V
                      </div>
                    )}
                  </div>

                  {/* 이름 & 프로그레스 */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <span className={`text-sm font-bold ${p.isMe ? "text-slate-900" : "text-slate-600"}`}>
                        {p.name} {p.isMe && <span className="text-xs text-yellow-500 font-normal">(나)</span>}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {p.current} / {quest.targetCount}회
                      </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out 
                          ${isCompleted ? "bg-blue-500" : "bg-yellow-400"}
                        `}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <hr className="my-6 border-slate-100" />

          {/* 하단 액션 버튼 (상태에 따라 변경) */}
          {quest.isJoined ? (
            // 이미 참여중인 경우
            <button
              className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition active:scale-95 hover:bg-green-600"
              onClick={() => alert("인증 기능은 Day 5에 구현됩니다!")}
            >
              📷 인증하기
            </button>
          ) : (
             // 미참여 상태인 경우
            <>
              <button
                className="w-full rounded-xl bg-slate-900 py-4 text-lg font-bold text-white shadow-lg shadow-slate-900/20 transition active:scale-95 hover:bg-slate-800"
                onClick={() => alert("참가 로직(API) 연결 필요")}
              >
                이 파티 참가하기
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                참가 시 {quest.entryFee} G가 차감됩니다.
              </p>
            </>
          )}

        </section>
        
      </div>
    </div>
  );
}