import { useState, useEffect, useCallback } from "react";
import { fetchQuestDetail } from "../api";
import { QuestDetailDto, QuestViewModel } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7173";

const getRandomAvatar = (uid: number) => {
  const emojis = ["🧑‍🦰", "🧟‍♂️", "👨", "🐤", "🐶", "🐱"];
  return emojis[uid % emojis.length];
};

const mapDataToViewModel = (data: QuestDetailDto, myId?: number): QuestViewModel => {
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

    verifications: (data.verifications || []).map((v) => {
      // 이미지 경로 처리
      let fullImageUrl = v.imageUrl;
      if (v.imageUrl && !v.imageUrl.startsWith("http")) {
        const baseUrl = API_BASE_URL.replace(/\/$/, "");
        const path = v.imageUrl.startsWith("/") ? v.imageUrl : `/${v.imageUrl}`;
        fullImageUrl = `${baseUrl}${path}`;
      }

      // UTC 시간을 로컬 시간으로 변환
      let dateStr = v.createdAt;
      if (!dateStr.endsWith("Z") && !dateStr.includes("+") && !dateStr.includes("T")) {
        dateStr = dateStr + "Z";
      } else if (dateStr.includes("T") && !dateStr.endsWith("Z") && !dateStr.includes("+")) {
        dateStr = dateStr + "Z";
      }

      return {
        id: v.id,
        userId: v.userId,
        isMine: myId ? myId === v.userId : false,
        userName: v.userName || "알 수 없음",
        userAvatar: getRandomAvatar(v.userId),
        imageUrl: fullImageUrl,
        comment: v.comment,
        createdAt: new Date(dateStr).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    }),
  };
};

export const useQuestDetail = (questId: string, userId?: number) => {
  const [quest, setQuest] = useState<QuestViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuest = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchQuestDetail(questId);

      if (result.success && result.data) {
        const mapped = mapDataToViewModel(result.data, userId);
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
  }, [questId, userId]);

  useEffect(() => {
    loadQuest();
  }, [loadQuest]);

  return { quest, setQuest, isLoading, error, reload: loadQuest };
};
