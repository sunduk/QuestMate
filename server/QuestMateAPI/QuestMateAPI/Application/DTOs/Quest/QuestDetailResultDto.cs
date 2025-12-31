namespace QuestMateAPI.Application.DTOs.Quest
{
    // 1. 참여자 정보 (리스트에 들어갈 항목)
    public class QuestParticipantDto
    {
        public long UserId { get; set; }
        public string Nickname { get; set; }
        public string? ProfileImageUrl { get; set; } // 아바타
        public bool IsHost { get; set; }     // 방장 여부
        public bool IsSuccess { get; set; }  // 성공 여부

        // ★ 아직 '인증(Verification)' 테이블이 없으므로 
        // 현재 인증 횟수는 일단 0으로 두거나 나중에 구현합니다.
        public int CurrentCount { get; set; }
    }

    // 2. 퀘스트 상세 정보 (본체)
    public class QuestDetailDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public int Category { get; set; }
        public int TargetCount { get; set; }   // 목표 횟수
        public int DurationDays { get; set; }  // 기간
        public int EntryFee { get; set; }      // 참가비
        public int MaxMemberCount { get; set; }
        public int CurrentMemberCount { get; set; }
        public string? ImageUrl { get; set; }
        public int Status { get; set; }

        // 내가 이 방에 참여 중인지 (UI 버튼 처리용: 참가하기 vs 입장하기)
        public bool IsJoined { get; set; }

        // 참여자 목록 포함
        public List<QuestParticipantDto> Participants { get; set; } = new();
    }

    // 3. 최종 응답 패킷
    public class QuestDetailResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public QuestDetailDto? Data { get; set; }
    }
}
