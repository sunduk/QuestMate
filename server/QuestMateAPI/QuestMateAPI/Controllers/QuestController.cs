using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Services;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestController : ControllerBase
    {
        private readonly IQuestService _questService;

        public QuestController(IQuestService questService)
        {
            _questService = questService;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> Login(CreateQuestRequestDto dto)
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
            {
                return Unauthorized(new CreateQuestResultDto
                {
                    Success = false,
                    Error = "INVALID_TOKEN_CLAIMS"
                });
            }

            var result = await _questService.CreateQuestAsync(userId, dto);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpGet("list")]
        // [Authorize] // 퀘스트 목록은 로그인 안 해도 보이게 할지 결정 (일단 주석)
        public async Task<IActionResult> GetList()
        {
            var result = await _questService.GetQuestListAsync();

            if (!result.Success)
            {
                return StatusCode(500, result);
            }

            return Ok(result);
        }

        // 퀘스트 상세 조회 (GET /api/quest/{id})
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(long id)
        {
            // 1. 내 ID 확인 (로그인 했다면 토큰에서 꺼냄, 안 했으면 0)
            long userId = 0;
            var userIdStr = User.FindFirst("uid")?.Value;

            if (!string.IsNullOrEmpty(userIdStr))
            {
                long.TryParse(userIdStr, out userId);
            }

            // 2. 서비스 호출 (questId, myUserId)
            var result = await _questService.GetQuestDetailAsync(id, userId);

            // 3. 결과 처리
            if (!result.Success)
            {
                // 퀘스트가 없는 경우 404 Not Found 리턴
                if (result.Error == "QUEST_NOT_FOUND")
                    return NotFound(result);

                // 그 외 서버 에러는 500
                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPost("join")]
        [Authorize]
        public async Task<IActionResult> Join([FromBody] QuestJoinRequestDto dto)
        {
            // 1. 내 ID 파싱
            var userIdStr = User.FindFirst("uid")?.Value;
            if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

            // 2. 서비스 호출
            var result = await _questService.JoinQuestAsync(dto.QuestId, userId);

            if (!result.Success)
            {
                // 에러 코드에 따라 상태코드 분기 (선택사항)
                if (result.Error == "QUEST_FULL") return Conflict(result);
                if (result.Error == "ALREADY_JOINED") return Conflict(result);

                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("leave")]
        [Authorize]
        public async Task<IActionResult> Leave([FromBody] QuestJoinRequestDto dto)
        {
            var userId = long.Parse(User.FindFirst("uid")?.Value ?? "0");
            var result = await _questService.LeaveQuestAsync(dto.QuestId, userId);

            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("verify")]
        [Authorize] // 로그인 필수
        public async Task<IActionResult> Verify([FromForm] QuestVerifyRequestDto dto) // ★ 핵심: [FromForm] 사용
        {
            // 1. 내 ID 파싱 (보안)
            var userIdStr = User.FindFirst("uid")?.Value;
            if (!long.TryParse(userIdStr, out long userId))
            {
                return Unauthorized();
            }

            // 2. 서비스 호출 (파일 저장 -> DB 기록)
            var result = await _questService.VerifyQuestAsync(userId, dto);

            // 3. 결과 처리
            if (!result.Success)
            {
                // 에러 메시지에 따라 상태코드 분기 가능
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("verify/delete")]
        [Authorize]
        public async Task<IActionResult> DeleteVerification([FromBody] QuestVerifyDeleteRequestDto dto)
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

            var result = await _questService.DeleteVerificationAsync(userId, dto);

            if (!result.Success)
            {
                if (result.Error == "VERIFICATION_NOT_FOUND") return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("verify/update")]
        [Authorize]
        public async Task<IActionResult> UpdateVerification([FromForm] QuestVerifyUpdateRequestDto dto)
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

            var result = await _questService.UpdateVerificationAsync(userId, dto);

            if (!result.Success)
            {
                if (result.Error == "VERIFICATION_NOT_FOUND") return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
