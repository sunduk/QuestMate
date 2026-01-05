using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Services.SocialLogin;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class NaverLoginController : ControllerBase
    {
        private readonly INaverAuthService _naverAuthService;

        public NaverLoginController(INaverAuthService naverAuthService)
        {
            _naverAuthService = naverAuthService;
        }

        [HttpGet]
        public IActionResult NaverLogin()
        {
            return Redirect(_naverAuthService.GetLoginUrl());
        }
    }
}
