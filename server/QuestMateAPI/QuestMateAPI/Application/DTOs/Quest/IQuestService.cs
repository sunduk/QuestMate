using QuestMateAPI.Application.DTOs.Quest;

namespace QuestMateAPI.Application.DTOs.Quest
{
    public interface IQuestService
    {
        // 퀘스트 생성
        Task<CreateQuestResultDto> CreateQuestAsync(long userId, CreateQuestRequestDto dto);

        // 퀘스트 목록 조회 (호스트 자신의 퀘스트만)
        Task<QuestListResultDto> GetQuestListAsync(long userId);

        // 퀘스트 상세 조회
        Task<QuestDetailResultDto> GetQuestDetailAsync(long questId, long userId);
        Task<long?> ResolveQuestIdByPublicIdAsync(string publicId);

        // 퀘스트 참가
        Task<QuestDetailResultDto> JoinQuestAsync(long questId, long userId);
        Task<QuestVerifyResultDto> VerifyQuestAsync(long userId, long questId, QuestVerifyRequestDto dto);
        Task<QuestVerifyDeleteResultDto> DeleteVerificationAsync(long userId, long questId, QuestVerifyDeleteRequestDto dto);
        Task<QuestVerifyUpdateResultDto> UpdateVerificationAsync(long userId, long questId, QuestVerifyUpdateRequestDto dto);
        Task<QuestDetailResultDto> LeaveQuestAsync(long questId, long userId);
    }
}
