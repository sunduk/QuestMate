using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Avatar;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Services;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvatarController : ControllerBase
    {
        private readonly IAvatarService _avatarService;

        public AvatarController(IAvatarService avatarService)
        {
            _avatarService = avatarService;
        }

        [HttpPost("change")]
        [Authorize]
        public async Task<IActionResult> ChangeAvatar(ChangeAvatarRequestDto dto)
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
            {
                return Unauthorized(new ChangeAvatarResultDto
                {
                    Success = false,
                    Error = "INVALID_TOKEN_CLAIMS"
                });
            }

            // 여기서 실제 아바타 변경 로직 호출 (예: 서비스 레이어)
            var result = await _avatarService.ChangeAvatarAsync(userId, dto);

            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(new ChangeAvatarResultDto
            {
                Success = true,
                Error = null,

                AvatarNumber = result.AvatarNumber
            });
        }
    }
}
