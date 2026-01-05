using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Services.SocialLogin;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class KakaoLoginController : ControllerBase
    {
        private readonly IKakaoAuthService _kakaoAuthService;

        public KakaoLoginController(IKakaoAuthService kakaoAuthService)
        {
            _kakaoAuthService = kakaoAuthService;
        }

        [HttpGet]
        public IActionResult KakaoLogin()
        {
            return Redirect(_kakaoAuthService.GetLoginUrl());
        }
    }
}
