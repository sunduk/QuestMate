namespace QuestMateAPI.Application.DTOs.Quest
{
    public class CreateQuestResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string? PublicId { get; set; }
    }
}
