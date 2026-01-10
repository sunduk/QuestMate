using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Application.DTOs.Quest
{
    public class QuestJoinRequestDto
    {
        [Required]
        public string PublicId { get; set; }
    }
}
