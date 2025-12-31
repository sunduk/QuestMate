using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Services
{
    public class QuestService : IQuestService
    {
        private readonly IQuestRepository _repository;

        public QuestService(IQuestRepository repository)
        {
            _repository = repository;
        }

        public async Task<CreateQuestResultDto> CreateQuestAsync(long userId, CreateQuestRequestDto dto)
        {
            try
            {
                // 1. DB 저장 요청 (방장 ID와 생성 정보 전달)
                // Repository에서 트랜잭션 걸고 Insert 후 생성된 ID를 반환받습니다.
                long? newQuestId = await _repository.CreateQuestAsync(userId, dto);

                if (newQuestId == null)
                {
                    return new CreateQuestResultDto
                    {
                        Success = false,
                        Error = "FAILED_TO_CREATE_QUEST"
                    };
                }

                // 2. 성공 로그 남기기
                //_logger.LogInformation("User {UserId} created new quest {QuestId}: {Title}", userId, newQuestId, dto.Title);

                // 3. 결과 반환
                return new CreateQuestResultDto
                {
                    Success = true,
                    Id = newQuestId.Value
                };
            }
            catch (Exception ex)
            {
                // 예외 발생 시 로그 찍고 실패 응답
                //_logger.LogError(ex, "Failed to create quest. User: {UserId}, Title: {Title}", userId, dto.Title);

                return new CreateQuestResultDto
                {
                    Success = false,
                    Error = "INTERNAL_SERVER_ERROR"
                };
            }
        }

        public async Task<QuestListResultDto> GetQuestListAsync()
        {
            try
            {
                // 리포지토리에서 데이터 가져오기
                var quests = await _repository.GetActiveQuestsAsync();

                return new QuestListResultDto
                {
                    Success = true,
                    Items = quests.ToList() // IEnumerable -> List 변환
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "GetQuestList Failed");
                return new QuestListResultDto
                {
                    Success = false,
                    Error = "DB_ERROR"
                };
            }
        }

        public async Task<QuestDetailResultDto> GetQuestDetailAsync(long questId, long userId)
        {
            try
            {
                // 1. Repository 호출 (Quest + Participants + IsJoined)
                var questDto = await _repository.GetQuestDetailAsync(questId, userId);

                // 2. 데이터 존재 여부 체크
                if (questDto == null)
                {
                    return new QuestDetailResultDto
                    {
                        Success = false,
                        Error = "QUEST_NOT_FOUND" // 클라이언트가 구분할 수 있는 에러 코드
                    };
                }

                // 3. 성공 응답
                return new QuestDetailResultDto
                {
                    Success = true,
                    Data = questDto
                };
            }
            catch (Exception ex)
            {
                // 4. 예외 처리
                //_logger.LogError(ex, "GetQuestDetail Failed. QuestId: {QuestId}", questId);

                return new QuestDetailResultDto
                {
                    Success = false,
                    Error = "INTERNAL_SERVER_ERROR"
                };
            }
        }
    }
}
