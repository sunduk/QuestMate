using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserInfoController : ControllerBase
    {
        [HttpGet("avatar")]
        public IActionResult GetStatus()
        {
            return Ok(new
            {
                Status = "UserInfo Service is running",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
