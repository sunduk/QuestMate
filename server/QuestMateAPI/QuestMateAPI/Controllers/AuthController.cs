using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.Interfaces.Repositories;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpPost("logout")]
        [Authorize] // 1. 인증된(토큰 있는) 유저만 입장 가능
        public async Task<IActionResult> Logout([FromBody] LogoutRequestDto dto)
        {
            // 2. 토큰에서 User ID 파싱 (안전한 파싱)
            // "uid" 키가 맞는지 Login 로직과 교차 검증 필수!
            var userIdStr = User.FindFirst("uid")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
            {
                // 토큰은 있는데 안에 ID가 없거나 이상함 -> 비정상 접근
                return Unauthorized(new LogoutResultDto
                {
                    Success = false,
                    Error = "INVALID_TOKEN_CLAIMS"
                });
            }

            // 3. 서비스 호출
            var result = await _authService.LogoutAsync(dto, userId);

            if (!result.Success)
            {
                // 로그아웃 실패는 보통 400(Bad Request) 혹은 그냥 200 주고 실패 메시지 보냄
                // 여기선 Unauthorized보다는 BadRequest가 의미상 더 맞을 수 있음
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(SignUpRequestDto dto)
        {
            var result = await _authService.SignUpAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto dto)
        {
            var result = await _authService.RefreshToken(dto);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpPost("guest")]
        [AllowAnonymous]
        public async Task<IActionResult> Guest()
        {
            var result = await _authService.CreateGuestAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userIdStr = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
            {
                return Unauthorized();
            }

            var dto = await _authService.GetMyInfoAsync(userId);
            if (dto == null) return NotFound();
            return Ok(dto);
        }
    }
}
