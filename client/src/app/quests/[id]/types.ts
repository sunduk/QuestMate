// ----------------------------------------------------------------------
// [서버 DTO]
// ----------------------------------------------------------------------
export interface QuestParticipantDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isHost: boolean;
  currentCount: number;
}

export interface VerificationDto {
  id: number;
  userId: number;
  userName: string;
  imageUrl: string;
  comment: string;
  createdAt: string;
}

export interface QuestDetailDto {
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
  verifications: VerificationDto[];
}

// ----------------------------------------------------------------------
// [클라이언트 ViewModel]
// ----------------------------------------------------------------------
export interface ParticipantViewModel {
  userId: number;
  name: string;
  avatar: string;
  current: number;
  isMe: boolean;
  isHost: boolean;
}

export interface VerificationViewModel {
  id: number;
  userId: number;
  isMine: boolean;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  comment: string;
  createdAt: string;
}

export interface QuestViewModel {
  id: number;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  entryFee: number;
  isJoined: boolean;
  participants: ParticipantViewModel[];
  verifications: VerificationViewModel[];
}
