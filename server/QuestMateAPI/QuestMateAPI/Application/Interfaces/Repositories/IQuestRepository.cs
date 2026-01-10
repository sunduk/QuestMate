using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface IQuestRepository
    {
        Task<long?> CreateQuestAsync(long hostUserId, CreateQuestRequestDto dto);
        Task<IEnumerable<QuestItemDto>> GetActiveQuestsAsync(long userId);
        Task<long?> GetQuestIdByPublicIdAsync(string publicId);
        Task<QuestDetailDto?> GetQuestDetailAsync(long questId, long requestUserId);
        Task<string> JoinQuestAsync(long questId, long userId); // 리턴값은 에러 메시지 (null이면 성공)
        Task<string> LeaveQuestAsync(long questId, long userId);
        Task<(int currentCount, bool isSuccess)> VerifyQuestAsync(long questId, long userId, string? imageUrl, string? comment);
        Task<string> DeleteVerificationAsync(long questId, long verificationId, long userId);
        Task<string> UpdateVerificationAsync(long questId, long verificationId, long userId, string? comment, bool isImageDeleted, string? imageUrl);
        Task<QuestVerification?> GetVerificationByIdAsync(long verificationId);
        Task<IEnumerable<QuestVerificationDto>> GetQuestVerificationsAsync(long questId);
    }
}
