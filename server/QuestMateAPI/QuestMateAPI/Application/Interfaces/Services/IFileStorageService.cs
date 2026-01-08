using System.IO;
using Microsoft.AspNetCore.Http;

namespace QuestMateAPI.Application.Interfaces.Services
{
    public interface IFileStorageService
    {
        // Save file under optional subfolder (e.g. "verifications") and return stored relative path
        Task<string> SaveAsync(IFormFile file, string subfolder);

        // Delete stored file by returned stored path
        Task DeleteAsync(string storedPath);

        // Open read stream for stored file
        Task<Stream?> OpenReadAsync(string storedPath);

        // Check exists
        Task<bool> ExistsAsync(string storedPath);
    }
}
