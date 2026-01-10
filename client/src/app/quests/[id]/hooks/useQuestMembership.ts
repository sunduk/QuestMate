import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { joinQuest, leaveQuest } from "../api";
import { QuestViewModel, QuestDetailDto } from "../types";
import showConfirm from "@/src/lib/showConfirm";

export const useQuestMembership = (quest: QuestViewModel | null, userId?: number) => {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleJoin = async (onSuccess: (data: QuestDetailDto) => void) => {
    if (!quest || !userId) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const confirmMsg =
      quest.entryFee > 0
        ? `${quest.entryFee} 골드가 차감됩니다. 참가하시겠습니까?`
        : "무료로 참가하시겠습니까?";

    const ok = await showConfirm(confirmMsg);
    if (!ok) return;

    setIsJoining(true);

    try {
      const result = await joinQuest(quest.publicId);

      if (result.success && result.data) {
        onSuccess(result.data);
        alert("파티에 참가했습니다! 🎉");
      }
    } catch (err) {
      console.error("Join Failed:", err);
      if (isAxiosError(err)) {
        const errorCode = err.response?.data?.error;
        if (errorCode === "QUEST_FULL") alert("이미 인원이 꽉 찼습니다.");
        else if (errorCode === "ALREADY_JOINED") alert("이미 참가 중입니다.");
        else if (errorCode === "NOT_ENOUGH_GOLD") alert("골드가 부족합니다.");
        else alert(`참가 실패: ${errorCode || "서버 오류"}`);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (publicId: string) => {
    if (!quest) return;

    const myInfo = quest.participants.find((p) => p.isMe);
    const isMyHost = myInfo?.isMe && myInfo?.isHost;
    const isLastMember = quest.participants.length === 1;

    let confirmMsg = "";
    if (isMyHost) {
      if (!isLastMember) {
        confirmMsg = "방장이 탈퇴하면 다음 순서의 멤버에게 방장이 위임됩니다.\n정말 탈퇴하시겠습니까?";
      } else {
        confirmMsg = "정말 노트를 삭제하시겠습니까?";
      }
    }
    const ok = await showConfirm(confirmMsg);
    if (!ok) return;

    setIsLeaving(true);

    try {
      const result = await leaveQuest(quest.publicId);

      if (result.success) {
        //alert("퀘스트를 탈퇴했습니다.");
        router.replace("/quests");
      }
    } catch (err) {
      console.error("Leave Failed:", err);

      if (isAxiosError(err)) {
        const errorCode = err.response?.data?.error;
        const status = err.response?.status;

        if (status === 404 || errorCode === "QUEST_NOT_FOUND") {
          alert("퀘스트가 삭제되었습니다. 목록으로 돌아갑니다.");
          router.replace("/quests");
          return;
        }

        alert(`탈퇴 실패: ${errorCode || "서버 오류"}`);
      }
    } finally {
      if (window.location.pathname.includes(`/quests/${publicId}`)) {
        setIsLeaving(false);
      }
    }
  };

  return { isJoining, isLeaving, handleJoin, handleLeave };
};
