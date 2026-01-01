"use client";

import { use } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useQuestDetail } from "./hooks/useQuestDetail";
import { useQuestMembership } from "./hooks/useQuestMembership";
import { useQuestVerification } from "./hooks/useQuestVerification";
import { QuestHeader } from "./components/QuestHeader";
import { ParticipantList } from "./components/ParticipantList";
import { VerificationFeed } from "./components/VerificationFeed";
import { VerificationForm } from "./components/VerificationForm";

interface QuestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();

  // Hooks
  const { quest, setQuest, isLoading, error } = useQuestDetail(id, user?.id);
  const { isJoining, isLeaving, handleJoin, handleLeave } = useQuestMembership(quest, user?.id);
  const verification = useQuestVerification(quest, setQuest);

  // Loading & Error
  if (isLoading) return <div className="p-10 text-center">로딩 중... 🔄</div>;
  if (error || !quest)
    return <div className="p-10 text-center text-red-500">{error || "퀘스트 없음"}</div>;

  return (
    <div className="relative h-full w-full bg-gray-50">
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
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          {/* 참여자 현황 */}
          <ParticipantList participants={quest.participants} targetCount={quest.targetCount} />

          <hr className="my-6 border-slate-100" />

          {/* 인증 내역 */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
              최근 인증 내역
            </h3>
            <VerificationFeed
              verifications={quest.verifications}
              editingVerifyId={verification.editingVerifyId}
              editingComment={verification.editingComment}
              editingPreviewUrl={verification.editingPreviewUrl}
              editingRemovedImage={verification.editingRemovedImage}
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

          {/* 인증하기 / 참가하기 */}
          <VerificationForm
            isJoined={quest.isJoined}
            isJoining={isJoining}
            isVerifying={verification.isVerifying}
            previewUrl={verification.previewUrl}
            comment={verification.comment}
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
        </section>
      </div>
    </div>
  );
}
