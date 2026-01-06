import { useState, useEffect, useCallback } from "react";
import { fetchQuestDetail } from "../api";
import { QuestDetailDto, QuestViewModel } from "../types";
import { AVATAR_ICONS, getAvatarPath } from "../../../../lib/avatarIcons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7173";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "https://localhost:7173";

const getRandomAvatar = (avatarNumber: number) => {
  // const emojis = ["🧑‍🦰", "🧟‍♂️", "👨", "🐤", "🐶", "🐱"];
  // return emojis[uid % emojis.length];

  const icons = [
    "/usericon/type03_calendar01",
    "/usericon/type03_default01",
    "/usericon/type03_default02",
    "/usericon/type03_default04",
    "/usericon/type03_footprint",
    "/usericon/type03_footprint02",
    "/usericon/type03_pencil01",
    "/usericon/typeo3_footprint02",
    "/usericon/girl.png", 
    "/usericon/kid.png",
    "/usericon/type02_baby_smile.png",
    "/usericon/type02_baby_surprise.png",
    "/usericon/type02_baby02_idle.png",
    "/usericon/type02_baby03_idle.png",
    "/usericon/type02_baby04_idle.png",
    "/usericon/type02_bear_angry.png",
    "/usericon/type02_bear_sleepy.png",
    "/usericon/type02_bear_smile.png",
    "/usericon/type02_cat_angry.png",
    "/usericon/type02_cat_idle.png",
    "/usericon/type02_cat_smile.png",
    "/usericon/type02_cat02_angry.png",
    "/usericon/type02_cat02_idle.png",
    "/usericon/type02_cat02_sleepy.png",
    "/usericon/type02_doci_sleepy.png",
    "/usericon/type02_doci_smile.png",
    "/usericon/type02_doci_surprise.png",
    "/usericon/type02_dog_smile.png",
    "/usericon/type02_dog_wink.png",
    "/usericon/type02_girl_angry.png",
    "/usericon/type02_girl_cry.png",
    "/usericon/type02_girl_smile.png",
    "/usericon/type02_leap_blue.png",
    "/usericon/type02_leap_red.png",
    "/usericon/type02_leap_yellow.png",
    "/usericon/type02_penguin_angry.png",
    "/usericon/type02_penguin_sleepy.png",
    "/usericon/type02_penguin_smile.png",
    "/usericon/type02_rose01_blue.png",
    "/usericon/type02_rose01_red.png",
    "/usericon/type02_rose01_yellow.png"
  ]
  return icons[avatarNumber];
  //return icons[uid % icons.length];
};

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
      let fullImageUrl = v.imageUrl;
      if (v.imageUrl && !v.imageUrl.startsWith("http")) {
        const baseUrl = IMAGE_BASE_URL.replace(/\/$/, "");
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
        userName: v.userName || "이름 없음",
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
