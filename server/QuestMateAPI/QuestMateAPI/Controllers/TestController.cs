using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Interfaces.Repositories;

namespace QuestMateAPI.Api.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly ILocalAccountRepository _localAccountRepo;
    private readonly IUserRepository _userRepo;

    public TestController(
        ILocalAccountRepository localAccountRepo,
        IUserRepository userRepo)
    {
        _localAccountRepo = localAccountRepo;
        _userRepo = userRepo;
    }

    [HttpGet("local-account")]
    public async Task<IActionResult> GetLocalAccount([FromQuery] string email)
    {
        var account = await _localAccountRepo.GetByEmailAsync(email);

        if (account == null)
            return NotFound("account not found");

        return Ok(account);
    }

    [HttpPost("user")]
    public async Task<IActionResult> CreateUser()
    {
        var userId = await _userRepo.CreateAsync();
        return Ok(new { userId });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var userId = User.FindFirst("uid")?.Value;
        return Ok(new { userId });
    }
}
