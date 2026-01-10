using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Application.DTOs.Quest
{
    // [요청] 퀘스트 생성 패킷
    public class CreateQuestRequestDto
    {
        [Required]
        public string Title { get; set; }

        public int Category { get; set; } // 0:운동, 1:공부...

        [Range(1, 999)]
        public int TargetCount { get; set; } // 목표 횟수

        [Range(1, 30)]
        public int DurationDays { get; set; } // 기간

        public int EntryFee { get; set; } // 참가비

        public int MaxMemberCount { get; set; }

        public string? ImageUrl { get; set; }
        // server generated public id (nanoid). service will set this before persisting.
        public string? PublicId { get; set; }
    }
}
