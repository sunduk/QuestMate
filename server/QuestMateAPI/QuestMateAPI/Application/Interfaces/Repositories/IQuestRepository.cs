using QuestMateAPI.Application.DTOs.Quest;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface IQuestRepository
    {
        Task<long?> CreateQuestAsync(long hostUserId, CreateQuestRequestDto dto);
        Task<IEnumerable<QuestItemDto>> GetActiveQuestsAsync();
        // 상세 조회 (요청한 유저 ID도 같이 받음 -> 참가 여부 확인용)
        Task<QuestDetailDto?> GetQuestDetailAsync(long questId, long requestUserId);
    }
}
