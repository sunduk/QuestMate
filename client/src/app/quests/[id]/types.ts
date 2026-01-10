// ----------------------------------------------------------------------
// [서버 DTO]
// ----------------------------------------------------------------------
export interface QuestParticipantDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isHost: boolean;
  currentCount: number;
  avatarNumber: number;
}

export interface VerificationDto {
  id: number;
  userId: number;
  userName: string;
  imageUrl: string;
  comment: string;
  createdAt: string;
  avatarNumber: number;
  nickname: string;
}

export interface QuestDetailDto {
  publicId: string;
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
  avatarNumber: number;
  nickname: string;
}

export interface VerificationViewModel {
  id: number;
  userId: number;
  isMine: boolean;
  userName: string;
  imageUrl?: string;
  // when image is protected on server, fetch via /files/verification/{id}
  fileId?: number;
  comment: string;
  createdAt: string;
  avatarNumber: number;
}

export interface QuestViewModel {
  // publicId 추가하기
  publicId: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  durationDays: number;
  entryFee: number;
  isJoined: boolean;
  participants: ParticipantViewModel[];
  verifications: VerificationViewModel[];
}
