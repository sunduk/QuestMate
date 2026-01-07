using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Interfaces.Services;
using QuestMateAPI.Application.DTOs.User;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserInfoController : ControllerBase
    {
        private readonly IUserInfoService _userInfoService;

        public UserInfoController(IUserInfoService userInfoService)
        {
            _userInfoService = userInfoService;
        }

        [HttpGet("avatar")]
        public IActionResult GetStatus()
        {
            return Ok(new
            {
                Status = "UserInfo Service is running",
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("updatenickname")]
        [Authorize]
        public async Task<IActionResult> UpdateNickname(ChangeNicknameRequestDto dto)
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
                return Unauthorized();

            var result = await _userInfoService.UpdateNicknameAsync(userId, dto.Nickname ?? string.Empty);
            if (result == null) return BadRequest(new { Success = false, Error = "INVALID_NICKNAME" });

            return Ok(result);
        }
    }
}
