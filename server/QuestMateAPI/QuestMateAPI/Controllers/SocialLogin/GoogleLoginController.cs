using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Services.SocialLogin;

namespace QuestMateAPI.Controllers.SocialLogin
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoogleLoginController : ControllerBase
    {
        private readonly IGoogleAuthService _googleAuthService;

        public GoogleLoginController(IGoogleAuthService googleAuthService)
        {
            _googleAuthService = googleAuthService;
        }

        [HttpGet]
        public IActionResult GoogleLogin()
        {
            return Redirect(_googleAuthService.GetLoginUrl());
        }
    }
}
