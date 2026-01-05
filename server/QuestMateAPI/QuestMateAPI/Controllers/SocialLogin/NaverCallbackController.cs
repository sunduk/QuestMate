using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Models.Auth;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Application.Services.SocialLogin;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class NaverCallbackController : ControllerBase
    {
        private readonly INaverAuthService _naverAuthService;
        private readonly ICommonAuthService _commonAuthService;
        private readonly JwtTokenGenerator _jwt;

        public NaverCallbackController(INaverAuthService naverAuthService, ICommonAuthService commonAuthService, JwtTokenGenerator jwt)
        {
            _naverAuthService = naverAuthService;
            _commonAuthService = commonAuthService;
            _jwt = jwt;
        }

        [HttpGet]
        public async Task<IActionResult> Index(string code, string state)
        {
            NaverToken? token = await _naverAuthService.GetTokenAsync(code, state);
            if (token == null)
            {
                return BadRequest("토큰 요청 실패");
            }

            NaverProfile? profile = await _naverAuthService.GetProfileAsync(token.access_token);
            if (profile == null)
            {
                return BadRequest("프로필 요청 실패");
            }

            var account = await _commonAuthService.SaveOrUpdateUserAsync(PlatformDefine.Naver, token.access_token, token.refresh_token, profile.response.id);

            string jwt = _jwt.GenerateAccessToken(account.Id);

            return Ok(jwt);
        }
    }
}