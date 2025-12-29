"use client"; // 버튼 클릭 등 상호작용이 있으므로 Client Component로 지정

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  // ----------------------------------------------------------------------
  // [테스트용 데이터]
  // 이 값을 false로 바꾸면 "퀘스트 없음" 화면이 나옵니다.
  // 나중에는 서버에서 DB 데이터를 받아와서 판단하게 됩니다.
  const [hasActiveQuest, setHasActiveQuest] = useState(true);
  // ----------------------------------------------------------------------

  return (
    <div className="flex min-h-full flex-col items-center px-6 py-8">
      
      {/* 1. 메인 로고 (공통) */}
      <div className="mb-8 flex flex-col items-center gap-1">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-300 text-xl shadow-sm">
          🏰
        </div>
        <h1 className="text-center text-3xl font-black uppercase leading-none text-slate-800">
          Quest Mate<br />
          <span className="text-yellow-500">Home</span>
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-400">HOME (LOBBY)</p>
      </div>

      {/* 2. 상태에 따른 분기 처리 (삼항 연산자) */}
      {hasActiveQuest ? (
        <ActiveQuestView />
      ) : (
        <EmptyQuestView />
      )}

      {/* (개발용) 상태 전환 버튼: 나중에는 지우세요 */}
      <button 
        onClick={() => setHasActiveQuest(!hasActiveQuest)}
        className="mt-10 text-xs text-gray-400 underline"
      >
        [개발용] 상태 전환하기 (Click)
      </button>
    </div>
  );
}

// ========================================================================
// [Sub Component 1] 퀘스트가 없을 때 (State A)
// ========================================================================
function EmptyQuestView() {
  return (
    <div className="flex w-full flex-col items-center rounded-xl bg-white p-8 shadow-md">
      <p className="mb-6 text-center text-lg font-bold text-slate-700">
        현재 진행 중인 모험이 없습니다.
      </p>
      
      {/* 퀘스트 찾기 페이지로 이동 */}
      <Link 
        href="/quests" 
        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-lg font-bold text-white shadow-md transition active:scale-95"
      >
        [퀘스트 찾아보기]
      </Link>
    </div>
  );
}

// ========================================================================
// [Sub Component 2] 퀘스트가 있을 때 (State B)
// ========================================================================
function ActiveQuestView() {
  // 더미 데이터: 파티원 상태
  const partyMembers = [
    { id: 1, name: "나", status: "yet", avatar: "🧑🏽" }, // yet: 미완료
    { id: 2, name: "동료1", status: "done", avatar: "👱🏻‍♂️" }, // done: 완료
    { id: 3, name: "동료2", status: "done", avatar: "🧑🏿" },
    { id: 4, name: "동료3", status: "yet", avatar: "👵🏻" },
  ];

  // 완료한 인원 계산
  const doneCount = partyMembers.filter(m => m.status === "done").length;

  return (
    <div className="flex w-full flex-col gap-6">
      
      {/* 1. D-Day 알림 */}
      <div className="text-center">
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-500">
          🔥 D-Day 카운트 : 마감까지 4시간 남음!
        </span>
      </div>

      {/* 2. 오늘의 미션 카드 */}
      <div className="flex flex-col rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-bold text-slate-800">
          오늘의 미션: 스쿼트 50개
        </h3>
        
        <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 font-bold text-white shadow-md transition active:scale-95">
          <span className="text-2xl">📷</span>
          <span className="text-lg">인증하기</span>
        </button>
      </div>

      {/* 3. 파티원 현황 카드 */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">
            파티 현황
          </h3>
          <span className="text-sm font-bold text-slate-500">
            {doneCount} / {partyMembers.length} 완료
          </span>
        </div>

        {/* 파티원 아바타 리스트 */}
        <div className="flex justify-between px-2">
          {partyMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-2">
              {/* 아바타 원형 */}
              <div 
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl shadow-sm
                  ${member.status === 'done' 
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200 ring-offset-1' // 완료 시 초록 테두리
                    : 'border-gray-200 bg-gray-100 grayscale' // 미완료 시 회색
                  }
                `}
              >
                {member.avatar}
              </div>
              
              {/* 상태 아이콘 (체크 표시) */}
              {member.status === 'done' && (
                <div className="-mt-4 rounded-full bg-green-500 p-0.5 text-[10px] text-white">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}