using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;

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
    }
}
