using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Application.DTOs.Quest
{
    public class QuestJoinRequestDto
    {
        [Required]
        public long QuestId { get; set; }
    }
}
