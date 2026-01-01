using QuestMateAPI.Application.DTOs.Quest;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface IQuestRepository
    {
        Task<long?> CreateQuestAsync(long hostUserId, CreateQuestRequestDto dto);
        Task<IEnumerable<QuestItemDto>> GetActiveQuestsAsync();
        Task<QuestDetailDto?> GetQuestDetailAsync(long questId, long requestUserId);
        Task<string> JoinQuestAsync(long questId, long userId); // 리턴값은 에러 메시지 (null이면 성공)
        Task<string> LeaveQuestAsync(long questId, long userId);
        Task<(int currentCount, bool isSuccess)> VerifyQuestAsync(long questId, long userId, string imageUrl, string? comment);
    }
}
