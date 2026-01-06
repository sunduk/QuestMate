namespace QuestMateAPI.Application.DTOs.Avatar
{
    public class ChangeAvatarResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public int AvatarNumber { get; set; }
    }
}
