using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuestMateAPI.Domain.Entities
{
    public class QuestVerification
    {
        public long Id { get; set; }
        public long QuestId { get; set; }
        public long UserId { get; set; }
        public string ImageUrl { get; set; }
        public string? Comment { get; set; }
        public int Status { get; set; } // 0:Pending, 1:Approved, 2:Rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}