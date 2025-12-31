namespace QuestMateAPI.Application.DTOs.Quest
{
    public class QuestItemDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public int Category { get; set; }
        public int DurationDays { get; set; }
        public int EntryFee { get; set; }
        public int CurrentMemberCount { get; set; }
        public int MaxMemberCount { get; set; }
        public string? ImageUrl { get; set; }
        public int Status { get; set; }
    }

    // [응답] 퀘스트 목록용 패킷
    public class QuestListResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public List<QuestItemDto>? Items { get; set; }
    }
}
