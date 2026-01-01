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

        public QuestService(IQuestRepository repository, IWebHostEnvironment environment)
        {
            _repository = repository;
            _environment = environment;
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
                // 1. 파일 유효성 검사 (방어 코드)
                if (dto.Image == null || dto.Image.Length == 0)
                {
                    return new QuestVerifyResultDto { Success = false, Error = "NO_FILE" };
                }

                // 확장자 체크 (이미지만 허용)
                var ext = Path.GetExtension(dto.Image.FileName).ToLower();
                if (ext != ".jpg" && ext != ".png" && ext != ".jpeg")
                {
                    return new QuestVerifyResultDto { Success = false, Error = "INVALID_IMAGE_TYPE" };
                }

                // 2. 저장 경로 설정 (wwwroot/uploads/yyyyMMdd/)
                // 날짜별로 폴더를 나누면 관리가 편합니다.
                // 2. 저장 경로 설정
                string webRootPath = _environment.WebRootPath;

                // 만약 wwwroot가 없어서 null이면, 수동으로 경로를 잡아줍니다.
                if (string.IsNullOrEmpty(webRootPath))
                {
                    // ContentRootPath는 실행 파일이 있는 곳 (프로젝트 루트)
                    webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                }

                string datePath = DateTime.Now.ToString("yyyyMMdd");
                string uploadsFolder = Path.Combine(webRootPath, "uploads", datePath);

                // 폴더 없으면 생성 (Directory.CreateDirectory)
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // 3. 유니크 파일명 생성 (Guid + 확장자)
                string uniqueFileName = $"{Guid.NewGuid()}{ext}";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // 4. 디스크에 파일 쓰기 (Stream Copy)
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

                // 웹에서 접근 가능한 URL 만들기 (예: /uploads/20260101/guid.jpg)
                // 백슬래시(\)를 슬래시(/)로 바꿔야 웹 URL 표준이 됩니다.
                string imageUrl = $"/uploads/{datePath}/{uniqueFileName}";

                // 5. DB 업데이트 (Repository 호출)
                // (currentCount, isSuccess) 튜플을 리턴받음
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
    }
}
