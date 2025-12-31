using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Domain.Entities
{
    public class Quest
    {
        public long Id { get; set; }
        public string? Title { get; set; }
        public int Category { get; set; } // 0:운동, 1:공부...
        public int TargetCount { get; set; }
        public int DurationDays { get; set; }
        public int EntryFee { get; set; }
        public int MaxMemberCount { get; set; }
        public string? ImageUrl { get; set; } // Nullable
        public int Status { get; set; } // 0:모집중
        public int CurrentMemberCount { get; set; }
        public long HostUserId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
