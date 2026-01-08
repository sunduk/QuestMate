using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.Interfaces.Services;
using QuestMateAPI.Application.Interfaces.Repositories;
using System.IO;

namespace QuestMateAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IFileStorageService _fileStorage;
        private readonly IQuestRepository _questRepository;

        public FilesController(IFileStorageService fileStorage, IQuestRepository questRepository)
        {
            _fileStorage = fileStorage;
            _questRepository = questRepository;
        }

        // GET /api/files/verification/{id}
        [HttpGet("verification/{id}")]
        [Authorize]
        public async Task<IActionResult> GetVerificationImage(long id)
        {
            // 1. parse user id from token
            var userIdStr = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out long userId))
                return Unauthorized();

            // 2. get verification record
            var verification = await _questRepository.GetVerificationByIdAsync(id);
            if (verification == null) return NotFound();

            // 3. check ownership
            if (verification.UserId != userId)
            {
                return Forbid();
            }

            var storedPath = verification.ImageUrl;
            if (string.IsNullOrEmpty(storedPath)) return NotFound();

            // 4. check existence
            var exists = await _fileStorage.ExistsAsync(storedPath);
            if (!exists) return NotFound();

            // 5. open stream
            var stream = await _fileStorage.OpenReadAsync(storedPath);
            if (stream == null) return NotFound();

            // 6. determine content type by extension
            var ext = Path.GetExtension(storedPath).ToLowerInvariant().TrimStart('.');
            string contentType = ext switch
            {
                "jpg" => "image/jpeg",
                "jpeg" => "image/jpeg",
                "png" => "image/png",
                _ => "application/octet-stream"
            };

            Response.Headers["Cache-Control"] = "private, no-store";

            return File(stream, contentType);
        }
    }
}
