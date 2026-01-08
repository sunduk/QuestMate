using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Domain.Entities;
using Microsoft.AspNetCore.Hosting; // IWebHostEnvironment 사용용

namespace QuestMateAPI.Application.Services
{
    public class QuestService : IQuestService
    {
        private readonly IQuestRepository _repository;
        private readonly IWebHostEnvironment _environment; // 웹 서버 환경 정보 (경로 찾기용)
        private readonly QuestMateAPI.Application.Interfaces.Services.IFileStorageService _fileStorage;

        public QuestService(IQuestRepository repository, IWebHostEnvironment environment, QuestMateAPI.Application.Interfaces.Services.IFileStorageService fileStorage)
        {
            _repository = repository;
            _environment = environment;
            _fileStorage = fileStorage;
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

                // [추가] 3. 인증샷 목록 가져오기
                var verifications = await _repository.GetQuestVerificationsAsync(questId);

                // [추가] 4. QuestDto에 인증샷 목록 할당
                questDto.Verifications = verifications.ToList();


                // 5. 성공 응답
                return new QuestDetailResultDto
                {
                    Success = true,
                    Data = questDto
                };
            }
            catch (Exception ex)
            {
                // 6. 예외 처리
                //_logger.LogError(ex, "GetQuestDetail Failed. QuestId: {QuestId}", questId);

                return new QuestDetailResultDto
                {
                    Success = false,
                    Error = "INTERNAL_SERVER_ERROR"
                };
            }
        }

        public async Task<QuestDetailResultDto> JoinQuestAsync(long questId, long userId)
        {
            // 1. 입장 처리 (트랜잭션)
            string error = await _repository.JoinQuestAsync(questId, userId);

            if (error != null)
            {
                return new QuestDetailResultDto
                {
                    Success = false,
                    Error = error
                };
            }

            // 2. 성공 시, 최신 상세 정보 조회해서 반환 (재활용)
            // 클라는 이 정보를 받아 UI를 바로 갱신합니다.
            return await GetQuestDetailAsync(questId, userId);
        }

        public async Task<QuestDetailResultDto> LeaveQuestAsync(long questId, long userId)
        {
            string error = await _repository.LeaveQuestAsync(questId, userId);
            if (error != null)
            {
                return new QuestDetailResultDto { Success = false, Error = error };
            }

            // 2. [변경] 성공 시, 상세 정보를 조회하지 않고 빈 성공 응답만 보냄
            // 클라이언트는 어차피 목록으로 씬 전환(Redirect)하므로 데이터가 필요 없음.
            // 또한, 방이 삭제된 경우 조회하면 에러가 나므로 이게 안전함.
            return new QuestDetailResultDto
            {
                Success = true,
                Data = null // 데이터 없음 (클라도 안 씀)
            };
        }

        public async Task<QuestVerifyResultDto> VerifyQuestAsync(long userId, QuestVerifyRequestDto dto)
        {
            try
            {
                string? imageUrl = null;

                // 1. 파일 업로드 처리 (선택적)
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    try
                    {
                        // let fileStorage validate extension and save
                        var stored = await _fileStorage.SaveAsync(dto.Image, "verifications");
                        // store the relative stored path in DB (not a public URL)
                        imageUrl = stored; // now this is internal path like "verifications/20260101/guid.jpg"
                    }
                    catch (InvalidOperationException)
                    {
                        return new QuestVerifyResultDto { Success = false, Error = "INVALID_IMAGE_TYPE" };
                    }
                }

                // 5. DB 업데이트 (Repository 호출)
                var result = await _repository.VerifyQuestAsync(dto.QuestId, userId, imageUrl, dto.Comment);

                return new QuestVerifyResultDto
                {
                    Success = true,
                    ImageUrl = imageUrl,
                    CurrentCount = result.currentCount,
                    IsCompleted = result.isSuccess
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Verify Failed User:{UserId} Quest:{QuestId}", userId, dto.QuestId);
                return new QuestVerifyResultDto { Success = false, Error = "INTERNAL_SERVER_ERROR" };
            }
        }

        public async Task<QuestVerifyDeleteResultDto> DeleteVerificationAsync(long userId, QuestVerifyDeleteRequestDto dto)
        {
            try
            {
                string error = await _repository.DeleteVerificationAsync(dto.QuestId, dto.VerificationId, userId);

                if (error != null)
                {
                    return new QuestVerifyDeleteResultDto { Success = false, Error = error };
                }

                return new QuestVerifyDeleteResultDto { Success = true };
            }
            catch (Exception ex)
            {
                return new QuestVerifyDeleteResultDto { Success = false, Error = "INTERNAL_SERVER_ERROR" };
            }
        }

        public async Task<QuestVerifyUpdateResultDto> UpdateVerificationAsync(long userId, QuestVerifyUpdateRequestDto dto)
        {
            try
            {
                string? imageUrl = null;

                // 1. 파일 업로드 처리 (선택적)
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    try
                    {
                        // delegate saving to file storage implementation
                        var stored = await _fileStorage.SaveAsync(dto.Image, "verifications");
                        imageUrl = stored; // internal stored relative path
                    }
                    catch (InvalidOperationException)
                    {
                        return new QuestVerifyUpdateResultDto { Success = false, Error = "INVALID_IMAGE_TYPE" };
                    }
                }
                else
                {
                    // 이미지가 선택되지 않은 경우 기존 이미지 삭제
                    var verification = await _repository.GetVerificationByIdAsync(dto.VerificationId);
                    if (verification is not null && !string.IsNullOrEmpty(verification.ImageUrl))
                    {
                        // delete using storage service (verification.ImageUrl holds stored relative path)
                        await _fileStorage.DeleteAsync(verification.ImageUrl);

                        // imageUrl을 null로 설정
                        imageUrl = null;
                    }
                }

                // 2. Repository 호출 (한 번만 호출)
                string error = await _repository.UpdateVerificationAsync(dto.QuestId, dto.VerificationId, userId, dto.Comment, imageUrl);

                if (error != null)
                {
                    return new QuestVerifyUpdateResultDto { Success = false, Error = error };
                }

                return new QuestVerifyUpdateResultDto { Success = true, UpdatedImageUrl = imageUrl };
            }
            catch (Exception ex)
            {
                return new QuestVerifyUpdateResultDto { Success = false, Error = "INTERNAL_SERVER_ERROR" };
            }
        }
    }
}
