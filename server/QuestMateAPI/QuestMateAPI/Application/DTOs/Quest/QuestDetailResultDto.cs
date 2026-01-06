namespace QuestMateAPI.Application.DTOs.Quest
{
    // 1. 참여자 정보 (리스트에 들어갈 항목)
    public class QuestParticipantDto
    {
        public long UserId { get; set; }
        public string Nickname { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsHost { get; set; }
        public bool IsSuccess { get; set; }
        public int CurrentCount { get; set; }
        public int AvatarNumber { get; set; }
    }

    // [추가] 인증 정보 DTO
    public class QuestVerificationDto
    {
        public long Id { get; set; }          // 인증 ID
        public long UserId { get; set; }        // 인증한 유저 ID
        public string ImageUrl { get; set; }      // 인증 이미지 URL
        public string Comment { get; set; }        // 코멘트
        public DateTime CreatedAt { get; set; }   // 생성일시
    }

    // 2. 퀘스트 상세 정보 (본체)
    public class QuestDetailDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public int Category { get; set; }
        public int TargetCount { get; set; }
        public int DurationDays { get; set; }
        public int EntryFee { get; set; }
        public int MaxMemberCount { get; set; }
        public int CurrentMemberCount { get; set; }
        public string? ImageUrl { get; set; }
        public int Status { get; set; }
        public bool IsJoined { get; set; }
        public List<QuestParticipantDto> Participants { get; set; } = new();

        // [추가] 인증샷 목록 포함
        public List<QuestVerificationDto> Verifications { get; set; } = new();
    }

    // 3. 최종 응답 패킷
    public class QuestDetailResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public QuestDetailDto? Data { get; set; }
    }
}