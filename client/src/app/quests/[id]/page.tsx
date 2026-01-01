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

// [추가] 클라이언트에서 사용할 인증 정보 타입
interface VerificationViewModel {
  id: number;
  userId: number; // 작성자 ID
  isMine: boolean; // 내 게시물인지 여부
  userName: string;
  userAvatar: string;
  imageUrl: string;
  comment: string;
  createdAt: string;
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
  verifications: VerificationViewModel[]; // [추가] 인증샷 목록
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
  verifications: VerificationViewModel[]; // [추가] 인증샷 목록
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

  // [추가] 인증샷 삭제 처리 중 상태
  const [deletingVerifyId, setDeletingVerifyId] = useState<number | null>(null);

  // 파일 선택창 트리거용 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClickVerify = () => {
    // 숨겨진 input을 대신 클릭해줌
    fileInputRef.current?.click();
  };

  // ----------------------------------------------------------------------
  // [Event] 인증샷 삭제
  // ----------------------------------------------------------------------
  const handleDeleteVerify = async (verifyId: number) => {
    if (!quest) return;
    if (!window.confirm("정말 이 인증샷을 삭제하시겠습니까?")) return;

    setDeletingVerifyId(verifyId);

    try {
      const response = await api.post("/quest/verify/delete", {
        QuestId: quest.id,
        VerificationId: verifyId,
      });
      const result = response.data;

      if (result.success) {
        alert("인증샷이 삭제되었습니다.");
        // UI에서 즉시 제거
        setQuest(prev => {
          if (!prev) return null;
          return {
            ...prev,
            verifications: prev.verifications.filter(v => v.id !== verifyId),
          };
        });
      } else {
        alert(result.error || "삭제 실패");
      }
    } catch (err) {
      console.error("Verify Delete Failed:", err);
      if (isAxiosError(err)) {
        alert(`삭제 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    } finally {
      setDeletingVerifyId(null);
    }
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
    // 1. 백엔드 주소 설정 (환경변수가 없으면 하드코딩된 로컬 주소 사용)
    // ★ 주의: 개발자님의 백엔드 포트번호를 확인하세요 (launchSettings.json)
    // 보통 http는 5000, https는 7000번대입니다.
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7173"; 

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

      verifications: (data.verifications || []).map(v => {
        // [수정] 이미지 경로가 http로 시작하지 않으면(상대경로면) 백엔드 주소를 붙임
        let fullImageUrl = v.imageUrl;
        if (v.imageUrl && !v.imageUrl.startsWith("http")) {
            // 슬래시 처리 (중복 방지)
            const baseUrl = API_BASE_URL.replace(/\/$/, ""); 
            const path = v.imageUrl.startsWith("/") ? v.imageUrl : `/${v.imageUrl}`;
            fullImageUrl = `${baseUrl}${path}`;
        }

        return {
          id: v.id,
          userId: v.userId,
          isMine: myId ? myId === v.userId : false,
          userName: v.userName || "알 수 없음", 
          userAvatar: getRandomAvatar(v.userId), 
          imageUrl: fullImageUrl,
          comment: v.comment,
          createdAt: (() => {
            // 서버에서 받은 UTC 시간을 로컬 시간으로 변환
            let dateStr = v.createdAt;
            // 'Z'가 없으면 UTC임을 명시
            if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('T')) {
              dateStr = dateStr + 'Z';
            } else if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
              dateStr = dateStr + 'Z';
            }
            return new Date(dateStr).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            });
          })()
        };
      })

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

  // ----------------------------------------------------------------------
  // [Event] 인증샷 수정
  // ----------------------------------------------------------------------
  const [editingVerifyId, setEditingVerifyId] = useState<number | null>(null); // 현재 편집 중인 인증샷 ID
  const [editingImage, setEditingImage] = useState<File | null>(null); // 편집 중인 이미지 파일
  const [editingPreviewUrl, setEditingPreviewUrl] = useState<string | null>(null); // 편집 중인 이미지 미리보기 URL
  const [editingComment, setEditingComment] = useState<string>(""); // 편집 중인 코멘트

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setEditingImage(file);
    const url = URL.createObjectURL(file);
    setEditingPreviewUrl(url);
  };

  const handleSubmitEdit = async () => {
    if (!quest || editingVerifyId === null) {
      alert("수정할 인증샷이 없습니다.");
      return;
    }

    // 이미지를 변경하지 않았다면 코멘트만 수정 가능
    // 빈 코멘트도 허용 (이미지만 올리는 경우)
    
    try {
      const formData = new FormData();
      formData.append("QuestId", quest.id.toString());
      formData.append("VerificationId", editingVerifyId.toString());
      // 빈 문자열도 허용
      formData.append("Comment", editingComment);

      if (editingImage) {
        formData.append("Image", editingImage);
      }

      const response = await api.post("/quest/verify/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = response.data;

      if (result.success) {
        setQuest((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            verifications: prev.verifications.map((v) =>
              v.id === editingVerifyId
                ? {
                    ...v,
                    comment: editingComment,
                    imageUrl: editingPreviewUrl || v.imageUrl,
                  }
                : v
            ),
          };
        });
        setEditingVerifyId(null);
        setEditingImage(null);
        setEditingPreviewUrl(null);
        setEditingComment("");
      } else {
        alert(result.error || "수정 실패");
      }
    } catch (err) {
      console.error("Verify Edit Failed:", err);
      if (isAxiosError(err)) {
        alert(`수정 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingVerifyId(null);
    setEditingImage(null);
    setEditingPreviewUrl(null);
    setEditingComment("");
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

          {/* [추가] 인증 내역 피드 섹션 */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">최근 인증 내역</h3>

            {quest.verifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                아직 올라온 인증샷이 없습니다.<br />첫 번째 주인공이 되어보세요! 🚀
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {quest.verifications.map((v) => (
                  <div 
                    key={v.id} 
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                      editingVerifyId === v.id ? "border-blue-500 ring-4 ring-blue-500/20" : "border-gray-100"
                    }`}
                  >
                    {/* 유저 정보 */}
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg border border-gray-200">
                        {v.userAvatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{v.userName}</span>
                        <span className="text-[10px] text-slate-400">{v.createdAt}</span>
                      </div>
                      {/* 수정/삭제 버튼 (편집 모드가 아닐 때만 표시) */}
                      {v.isMine && editingVerifyId !== v.id && (
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() => {
                              setEditingVerifyId(v.id);
                              setEditingComment(v.comment);
                              setEditingPreviewUrl(v.imageUrl);
                              setEditingImage(null);
                            }}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 active:scale-95"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteVerify(v.id)}
                            disabled={deletingVerifyId === v.id}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                          >
                            {deletingVerifyId === v.id ? "삭제중" : "삭제"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 인증 이미지 */}
                    <div className="relative aspect-video w-full bg-gray-100">
                      <img
                        src={editingVerifyId === v.id ? (editingPreviewUrl || v.imageUrl) : v.imageUrl}
                        alt="Verification"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
                        }}
                      />
                      {/* 이미지 변경 버튼 (편집 모드일 때 우측 하단에 표시) */}
                      {editingVerifyId === v.id && (
                        <button
                          onClick={() => {
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.accept = "image/*";
                            fileInput.onchange = (e) => {
                              const target = e.target as HTMLInputElement;
                              const file = target.files?.[0];
                              if (!file) return;
                              if (!file.type.startsWith("image/")) {
                                alert("이미지 파일만 업로드 가능합니다.");
                                return;
                              }
                              setEditingImage(file);
                              const url = URL.createObjectURL(file);
                              setEditingPreviewUrl(url);
                            };
                            fileInput.click();
                          }}
                          className="absolute bottom-2 right-2 rounded-md bg-gray-800 bg-opacity-70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-opacity-90 active:scale-95"
                        >
                          변경
                        </button>
                      )}
                    </div>

                    {/* 코멘트 영역 */}
                    <div className="p-3">
                      {editingVerifyId === v.id ? (
                        <textarea
                          value={editingComment ?? ""}
                          onChange={(e) => setEditingComment(e.target.value)}
                          placeholder="한줄 소감을 남겨주세요."
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
                          rows={2}
                        />
                      ) : (
                        v.comment && (
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {v.comment}
                          </p>
                        )
                      )}
                    </div>

                    {/* 제출/취소 버튼 (편집 모드일 때 카드 하단에 표시) */}
                    {editingVerifyId === v.id && (
                      <div className="flex gap-2 border-t border-gray-100 p-3">
                        <button
                          onClick={handleSubmitEdit}
                          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                        >
                          제출
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-300 active:scale-95"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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