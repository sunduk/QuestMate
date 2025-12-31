namespace QuestMateAPI.Application.DTOs.Quest
{
    public class CreateQuestResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public long Id { get; set; }
    }
}
