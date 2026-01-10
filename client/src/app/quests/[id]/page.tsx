"use client";

import { use, useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useQuestDetail } from "./hooks/useQuestDetail";
import { useQuestMembership } from "./hooks/useQuestMembership";
import { useQuestVerification } from "./hooks/useQuestVerification";
import { QuestHeader } from "./components/QuestHeader";
import { ParticipantList } from "./components/ParticipantList";
import { VerificationFeed } from "./components/VerificationFeed";
import { VerificationForm } from "./components/VerificationForm";
import { AuthRequired } from "../../../components/AuthRequired";

interface QuestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  // Log once on the client — guard against StrictMode double-mount and re-renders
  const _didLogRef = useRef(false);
  useEffect(() => {
    if (!_didLogRef.current) {
      console.log("QuestDetailPage 렌더링");
      _didLogRef.current = true;
    }
  }, []);

  console.log("QuestDetailPage 실행");
  const { id } = use(params);
  const { user } = useAuthStore();

  // Hooks
  const { quest, setQuest, isLoading, error } = useQuestDetail(id, user?.id);
  const { isJoining, isLeaving, handleJoin, handleLeave } = useQuestMembership(quest, user?.id);
  const verification = useQuestVerification(quest, setQuest);

  useEffect(() => {
    if (!quest) return;
    const uid = user?.id;
    const isMy = (otherId: number) => typeof uid === "number" && uid === otherId;

    const newParticipants = quest.participants.map((p) => ({ ...p, isMe: isMy(p.userId) }));
    const newVerifications = quest.verifications.map((v) => ({ ...v, isMine: isMy(v.userId) }));

    const participantsChanged = newParticipants.some((p, i) => p.isMe !== quest.participants[i].isMe);
    const verificationsChanged = newVerifications.some((v, i) => v.isMine !== quest.verifications[i].isMine);

    if (participantsChanged || verificationsChanged) {
      setQuest({ ...quest, participants: newParticipants, verifications: newVerifications });
    }
  }, [user?.id, quest, setQuest]);

  // Loading & Error
  if (isLoading) return <div className="p-10 text-center">로딩 중... 🔄</div>;
  if (error === "401") return <AuthRequired />;

  if (!quest)
    return <div className="p-10 text-center text-red-500">퀘스트를 불러올 수 없습니다.</div>;

  const myProgress = quest.participants.find((p) => p.isMe);
  const isCompleted = myProgress ? myProgress.current >= quest.durationDays : false;

  return (
    <div 
      className="relative h-full w-full bg-gray-50 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="absolute inset-0 overflow-y-auto px-6 py-8 pb-24">
        {/* 상단 정보 */}
        <QuestHeader
          icon={quest.icon}
          title={quest.title}
          description={quest.description}
          isJoined={quest.isJoined}
          isLeaving={isLeaving}
          onLeave={() => handleLeave(id)}
        />

        {/* 메인 카드 */}
        <section className="rounded-3xl bg-[#fcf6ea] p-6 shadow-sm border border-gray-100">
          {/* 참여자 현황 */}
          <ParticipantList participants={quest.participants} targetCount={quest.targetCount} durationDays={quest.durationDays} />

          <hr className="my-6 border-slate-100" />

          {/* 인증하기 / 참가하기 */}
          <VerificationForm
            isJoined={quest.isJoined}
            isCompleted={isCompleted}
            isJoining={isJoining}
            isVerifying={verification.isVerifying}
            previewUrl={verification.previewUrl}
            comment={verification.comment}
            commentInvalid={verification.commentInvalid}
            entryFee={quest.entryFee}
            onJoin={() =>
              handleJoin(() => {
                // 참가 성공 시 전체 데이터 다시 로드
                window.location.reload();
              })
            }
            onFileChange={verification.handleFileChange}
            onCommentChange={verification.setComment}
            onSubmit={verification.handleSubmitVerify}
            onCancel={() => {
              verification.setPreviewUrl(null);
              verification.setVerifyImage(null);
            }}
          />

          <hr className="my-6 border-slate-100" />

          {/* 인증 내역 */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm text-[#472c17] font-bold uppercase tracking-wider">
              최근 기록
            </h3>
            <VerificationFeed
              verifications={quest.verifications}
              editingVerifyId={verification.editingVerifyId}
              editingComment={verification.editingComment}
              editingPreviewUrl={verification.editingPreviewUrl}
              editingRemovedImage={verification.editingRemovedImage}
                editingCommentInvalid={verification.editingCommentInvalid}
              deletingVerifyId={verification.deletingVerifyId}
              onStartEdit={verification.startEdit}
              onCancelEdit={verification.cancelEdit}
              onSubmitEdit={verification.handleSubmitEdit}
              onDelete={verification.handleDelete}
              onEditCommentChange={verification.setEditingComment}
              onEditImageChange={verification.handleEditImageChange}
              onRemoveEditImage={verification.handleRemoveEditImage}
            />
          </div>

        </section>
      </div>
    </div>
  );
}
