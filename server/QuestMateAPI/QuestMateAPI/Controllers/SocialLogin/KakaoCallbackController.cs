using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Models.Auth;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Application.Services.SocialLogin;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class KakaoCallbackController : ControllerBase
    {
        private readonly IKakaoAuthService _kakaoAuthService;
        private readonly ICommonAuthService _commonAuthService;
        private readonly JwtTokenGenerator _jwt;

        public KakaoCallbackController(IKakaoAuthService kakaoAuthService, ICommonAuthService commonAuthService, JwtTokenGenerator jwt)
        {
            _kakaoAuthService = kakaoAuthService;
            _commonAuthService = commonAuthService;
            _jwt = jwt;
        }

        [HttpGet]
        public async Task<IActionResult> Index(string code)
        {
            KakaoToken? token = await _kakaoAuthService.GetTokenAsync(code);
            if (token == null)
            {
                return BadRequest("토큰 요청 실패");
            }

            KakaoProfile? profile = await _kakaoAuthService.GetProfileAsync(token.access_token);
            if (profile == null)
            {
                return BadRequest("프로필 요청 실패");
            }

            var account = await _commonAuthService.SaveOrUpdateUserAsync(PlatformDefine.Kakao, token.access_token, token.refresh_token, profile.id.ToString());

            string jwt = _jwt.GenerateAccessToken(account.Id);

            return Ok(jwt);
        }
    }
}