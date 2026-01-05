using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.Models.Auth;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Application.Services.SocialLogin;
using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoogleCallbackController : ControllerBase
    {
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ICommonAuthService _commonAuthService;
        private readonly JwtTokenGenerator _jwt;

        public GoogleCallbackController(IGoogleAuthService googleAuthService, ICommonAuthService commonAuthService, JwtTokenGenerator jwt)
        {
            _googleAuthService = googleAuthService;
            _commonAuthService = commonAuthService;
            _jwt = jwt;
        }

        [HttpGet]
        public async Task<IActionResult> Index(string code)
        {
            GoogleToken? token = await _googleAuthService.GetTokenAsync(code);
            if (token == null)
            {
                return BadRequest("토큰 요청 실패");
            }

            if (token.access_token == null)
            {
                return BadRequest("액세스 토큰이 없습니다.");
            }

            GoogleProfile? profile = await _googleAuthService.GetProfileAsync(token.access_token);
            if (profile == null)
            {
                return BadRequest("프로필 요청 실패");
            }

            if (profile.id == null)
            {
                return BadRequest("프로필 ID가 없습니다.");
            }

            if (token.refresh_token == null)
            {
                token.refresh_token = string.Empty; // 리프레시 토큰이 없을 경우 빈 문자열로 설정
            }
            
            SocialAccount socialAccount = await _commonAuthService.SaveOrUpdateUserAsync(PlatformDefine.Google, token.access_token, token.refresh_token, profile.id);

            string jwt = _jwt.GenerateAccessToken(socialAccount.UserId);

            LoginResultDto result = new LoginResultDto
            {
                Success = true,
                UserId = socialAccount.UserId,
                AccessToken = jwt,
            };

            return Ok(result);
        }
    }
}