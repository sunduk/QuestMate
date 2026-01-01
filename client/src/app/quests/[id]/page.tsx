"use client";

import React, { use, useEffect, useState, useCallback, useRef } from "react";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../store/useAuthStore";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

// ----------------------------------------------------------------------
// [타입 정의] (서버 DTO & 클라 ViewModel)
// ----------------------------------------------------------------------
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

interface QuestViewModel {
  id: number;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  entryFee: number;
  isJoined: boolean;
  participants: {
    userId: number;
    name: string;
    avatar: string;
    current: number;
    isMe: boolean;
    isHost: boolean;
  }[];
}

interface QuestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore(); 

  const [quest, setQuest] = useState<QuestViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false); // 참가 처리 중 상태
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false); // 탈퇴 처리 중 상태 추가

  // ★ [인증 관련 State 추가]
  const [isVerifying, setIsVerifying] = useState(false); // 업로드 진행 중
  const [verifyImage, setVerifyImage] = useState<File | null>(null); // 선택한 파일 객체
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 미리보기 URL
  const [comment, setComment] = useState(""); // 한줄 소감

  // 파일 선택창 트리거용 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClickVerify = () => {
    // 숨겨진 input을 대신 클릭해줌
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setVerifyImage(file);
    
    // 브라우저 메모리에 임시 URL 생성 (미리보기용)
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // ----------------------------------------------------------------------
  // [Event] 인증 제출 (Upload)
  // ----------------------------------------------------------------------
  const handleSubmitVerify = async () => {
    if (!quest || !verifyImage) return;

    if (!confirm("이 사진으로 인증하시겠습니까?")) return;

    setIsVerifying(true);

    try {
      // 1. FormData 생성
      const formData = new FormData();
      formData.append("QuestId", quest.id.toString());
      // 코멘트가 없으면 빈 문자열이라도 보내야 안전할 수 있음 (서버 설정에 따라)
      formData.append("Comment", comment || ""); 
      formData.append("Image", verifyImage); 

      // 2. 전송 (★ 여기가 수정됨)
      // 세 번째 인자로 설정 객체(Config)를 넘겨서 Content-Type을 덮어씁니다.
      const response = await api.post("/quest/verify", formData, {
        headers: {
          // 이렇게 명시하면 Axios가 "아, 폼 데이터구나" 하고 
          // 브라우저가 자동으로 생성하는 boundary(구분자)를 포함한 정확한 헤더를 사용하게 해줍니다.
          "Content-Type": "multipart/form-data",
        },
      });
      
      const result = response.data;

      if (result.success) {
        alert("인증 완료! 오늘도 한 걸음 성장하셨네요! 💪");
        
        // 3. UI 정리 (미리보기 닫기)
        setVerifyImage(null);
        setPreviewUrl(null);
        setComment("");

        // 4. 데이터 갱신 (내 카운트 올라간 거 반영)
        // (단순히 카운트만 올리는게 아니라, 서버 데이터를 다시 불러오는게 제일 안전함)
        // 여기서는 편의상 리로드 함수를 호출하거나, 직접 state를 수정
        // setQuest(prev => ... ) 로직이 복잡하니 fetchDetail을 다시 부르는게 낫습니다.
        window.location.reload(); // MVP니까 가장 확실한 방법 (새로고침)
        
      } else {
        alert(result.error || "인증 실패");
      }
    } catch (err) {
      console.error("Verify Failed:", err);
      if (isAxiosError(err)) {
        alert(`업로드 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

// ----------------------------------------------------------------------
  // [Event] 퀘스트 탈퇴
  // ----------------------------------------------------------------------
  const handleLeave = async () => {
    if (!quest || !user) return;

    // 1. 내가 방장인지, 마지막 멤버인지 확인
    const myInfo = quest.participants.find(p => p.isMe);
    const isMyHost = myInfo?.isMe && myInfo?.isHost;
    const isLastMember = quest.participants.length === 1;

    let confirmMsg = "정말 퀘스트를 포기하시겠습니까?\n(참가비는 환불되지 않습니다.)";
    
    if (isMyHost) {
       if (!isLastMember) {
          confirmMsg = "방장이 탈퇴하면 다음 순서의 멤버에게 방장이 위임됩니다.\n정말 탈퇴하시겠습니까?";
       } else {
          confirmMsg = "남은 멤버가 없어 퀘스트가 삭제됩니다.\n정말 삭제하시겠습니까?";
       }
    }

    if (!window.confirm(confirmMsg)) return;

    setIsLeaving(true);

    try {
      // 2. 탈퇴 요청
      const response = await api.post("/quest/leave", { questId: quest.id });
      const result = response.data;

      // 3. 성공 처리 (일반적인 경우)
      if (result.success) {
        alert("퀘스트를 탈퇴했습니다.");
        router.replace("/quests"); // 뒤로가기 방지를 위해 replace 사용
      }

    } catch (err) {
      console.error("Leave Failed:", err);
      
      // 4. [핵심] 방이 폭파되어 'QUEST_NOT_FOUND' 에러가 난 경우 -> 이것도 성공으로 간주
      if (isAxiosError(err)) {
        const errorCode = err.response?.data?.error;
        const status = err.response?.status;

        // 404(NotFound)거나 명시적 에러코드가 QUEST_NOT_FOUND라면 방이 삭제된 것
        if (status === 404 || errorCode === "QUEST_NOT_FOUND") {
            alert("퀘스트가 삭제되었습니다. 목록으로 돌아갑니다.");
            router.replace("/quests");
            return;
        }

        // 그 외 진짜 에러 처리
        alert(`탈퇴 실패: ${errorCode || "서버 오류"}`);
      }
    } finally {
      // 페이지 이동이 일어나면 어차피 언마운트되지만, 안전하게 처리
      if (window.location.pathname.includes(`/quests/${id}`)) {
          setIsLeaving(false);
      }
    }
  };

  // ----------------------------------------------------------------------
  // [Helper] 서버 데이터를 UI 데이터로 변환 (Parser)
  // ----------------------------------------------------------------------
  const mapDataToViewModel = useCallback((data: QuestDetailDto, myId?: number): QuestViewModel => {
    return {
      id: data.id,
      title: data.title,
      description: `${data.durationDays}일 동안 진행되는 퀘스트입니다. 목표를 달성하고 보상을 획득하세요!`,
      targetCount: data.targetCount,
      entryFee: data.entryFee,
      isJoined: data.isJoined,
      icon: data.category === 0 ? "🏋️" : data.category === 1 ? "📚" : "🌱",
      
      participants: data.participants.map((p) => ({
        userId: p.userId,
        name: p.nickname || `유저 ${p.userId}`,
        avatar: p.profileImageUrl || getRandomAvatar(p.userId),
        current: p.currentCount,
        isMe: myId ? myId === p.userId : false,
        isHost: p.isHost,
      })),
    };
  }, []);

  // ----------------------------------------------------------------------
  // [API] 초기 로드
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/quest/${id}`);
        const result = response.data;

        if (result.success && result.data) {
          // 파싱 후 상태 업데이트
          const mapped = mapDataToViewModel(result.data, user?.id);
          setQuest(mapped);
        } else {
          setError(result.error || "정보 로드 실패");
        }
      } catch (err) {
        console.error(err);
        setError("서버 통신 오류");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, user, mapDataToViewModel]);

  // ----------------------------------------------------------------------
  // [Event] 참가하기 버튼 클릭
  // ----------------------------------------------------------------------
  const handleJoin = async () => {
    if (!quest) return;
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 확인 팝업 (게임의 Confirm Dialog)
    const confirmMsg = quest.entryFee > 0 
      ? `${quest.entryFee} 골드가 차감됩니다. 참가하시겠습니까?` 
      : "무료로 참가하시겠습니까?";
      
    if (!window.confirm(confirmMsg)) return;

    setIsJoining(true); // 버튼 비활성화 (따닥 방지)

    try {
      // 1. 참가 요청 패킷 전송
      const response = await api.post("/quest/join", { questId: quest.id });
      const result = response.data;

      if (result.success && result.data) {
        // 2. 성공 시 서버가 준 최신 데이터로 UI 즉시 갱신 (새로고침 X)
        const updatedQuest = mapDataToViewModel(result.data, user.id);
        setQuest(updatedQuest);
        alert("파티에 참가했습니다! 🎉");
      } 
    } catch (err) {
      console.error("Join Failed:", err);
      if (isAxiosError(err)) {
        const errorCode = err.response?.data?.error;
        // 에러 코드별 메시지 처리
        if (errorCode === "QUEST_FULL") alert("이미 인원이 꽉 찼습니다.");
        else if (errorCode === "ALREADY_JOINED") alert("이미 참가 중입니다.");
        else if (errorCode === "NOT_ENOUGH_GOLD") alert("골드가 부족합니다.");
        else alert(`참가 실패: ${errorCode || "서버 오류"}`);
      }
    } finally {
      setIsJoining(false); // 버튼 활성화
    }
  };


  // 유틸: 임시 아바타
  const getRandomAvatar = (uid: number) => {
    const emojis = ["🧑‍🦰", "🧟‍♂️", "👨", "🐤", "🐶", "🐱"];
    return emojis[uid % emojis.length];
  };

  if (isLoading) return <div className="p-10 text-center">로딩 중... 🔄</div>;
  if (error || !quest) return <div className="p-10 text-center text-red-500">{error || "퀘스트 없음"}</div>;

  return (
    <div className="relative h-full w-full bg-gray-50">
      
      {/* 스크롤 영역 */}
      <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">
        
        {/* 상단 정보 */}
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

          {/* ★ [UI 추가] 퀘스트 탈퇴 버튼 (우측 상단 배치) */}
          {quest.isJoined && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="absolute top-4 right-4 z-10 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-md transition active:scale-95 hover:bg-red-700 disabled:bg-gray-400"
            >
              {isLeaving ? "처리중..." : "퀘스트 탈퇴"}
            </button>
          )}
        </div>

        {/* 메인 카드 */}
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              참여자 현황 <span className="text-slate-400 text-sm font-normal">({quest.participants.length}/4)</span>
            </h2>
          </div>

          {/* 리스트 */}
          <div className="flex flex-col gap-4">
            {quest.participants.map((p, index) => {
              const progress = Math.min(100, Math.max(0, (p.current / quest.targetCount) * 100));
              const isCompleted = p.current >= quest.targetCount;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm border-2 
                      ${p.isMe ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-100"}`}
                    >
                      {p.avatar}
                    </div>
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ring-2 ring-white">V</div>
                    )}
                  </div>
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

          {/* ★ [수정됨] 하단 버튼 영역 */}
           {quest.isJoined ? (
             <div className="flex flex-col gap-4">
                
                {/* 1. 인증 미리보기 영역 (파일 선택됐을 때만 보임) */}
                {previewUrl && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-fade-in-up">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="mb-3 w-full rounded-lg object-cover h-48 border border-gray-200"
                    />
                    <input 
                      type="text"
                      placeholder="한줄 소감 (선택)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-green-500"
                    />
                    <div className="mt-3 flex gap-2">
                       <button 
                         onClick={handleSubmitVerify}
                         disabled={isVerifying}
                         className="flex-1 rounded-lg bg-green-500 py-3 font-bold text-white shadow-md active:scale-95 disabled:bg-gray-400"
                       >
                         {isVerifying ? "전송 중..." : "제출하기"}
                       </button>
                       <button 
                         onClick={() => { setPreviewUrl(null); setVerifyImage(null); }}
                         className="rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-600 active:scale-95"
                       >
                         취소
                       </button>
                    </div>
                  </div>
                )}

                {/* 2. 인증하기 버튼 (파일 선택 전) */}
                {!previewUrl && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition active:scale-95 hover:bg-green-600"
                      onClick={onClickVerify}
                    >
                      📷 인증하기
                    </button>
                  </>
                )}
             </div>
           ) : (
            <>
              <button
                onClick={handleJoin}
                disabled={isJoining} // 처리 중 클릭 방지
                className={`w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition active:scale-95
                  ${isJoining 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                  }
                `}
              >
                {isJoining ? "입장 처리 중..." : "이 파티 참가하기"}
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