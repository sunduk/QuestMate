import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchQuestDetail } from "../api";
import { QuestDetailDto, QuestViewModel } from "../types";
import { getAvatarPath } from "../../../../lib/avatarIcons";

const mapDataToViewModel = (data: QuestDetailDto, myId?: number): QuestViewModel => {
  return {
    id: data.id,
    title: data.title,
    description: `${data.durationDays}일 동안 남기는 노트입니다.`,
    targetCount: data.targetCount,
    durationDays: data.durationDays,
    entryFee: data.entryFee,
    isJoined: data.isJoined,
    icon: data.category === 0 ? "/icon_health.png" : data.category === 1 ? "/icon_study.png" : "/icon_living.png",

    participants: data.participants.map((p) => {
      return {
        userId: p.userId,
        name: p.nickname || `유저 ${p.userId}`,
        avatar: p.profileImageUrl || getAvatarPath(p.avatarNumber),
        current: p.currentCount,
        isMe: myId ? myId === p.userId : false,
        isHost: p.isHost,
        avatarNumber: p.avatarNumber,
        nickname: p.nickname
      };
    }),

    verifications: (data.verifications || []).map((v) => {
      // 이미지 경로 처리
      // If server returned an absolute public URL, keep it. Otherwise treat image as protected
      // and fetch via protected endpoint using the verification id.
      let fullImageUrl: string | undefined = undefined;
      if (v.imageUrl && v.imageUrl.startsWith("http")) {
        fullImageUrl = v.imageUrl;
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
        userName: v.nickname || "이름 없음",
        imageUrl: fullImageUrl,
        // when image is protected, client should call /files/verification/{id}
        fileId: v.id,
        comment: v.comment,
        createdAt: (() => {
          const d = new Date(dateStr);
          const now = new Date();
          const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

          if (diffSec < 60) return "방금전";
          if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
          if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
          if (diffSec < 2 * 86400) return "하루 전";

          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
        })(),
        avatarNumber: v.avatarNumber
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
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // Unauthorized — user likely not logged in; don't surface an error message
          setError(err.response?.status.toString());
        } else {
          console.error(err);
          setError("서버 통신 오류");
        }
      } finally {
      setIsLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    loadQuest();
  }, [loadQuest]);

  return { quest, setQuest, isLoading, error, reload: loadQuest };
};
