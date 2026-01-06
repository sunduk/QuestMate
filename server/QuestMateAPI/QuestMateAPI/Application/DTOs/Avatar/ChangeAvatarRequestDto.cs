using System.ComponentModel.DataAnnotations;

namespace QuestMateAPI.Application.DTOs.Avatar
{
    public class ChangeAvatarRequestDto
    {
        [Required]
        public int AvatarNumber { get; set; }
    }
}
