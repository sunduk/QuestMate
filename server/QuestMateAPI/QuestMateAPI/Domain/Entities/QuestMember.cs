using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Domain.Entities
{
    public class QuestMember
    {
        public long Id { get; set; }
        public long QuestId { get; set; }
        public long UserId { get; set; }
        public bool IsHost { get; set; }
        public bool IsSuccess { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
