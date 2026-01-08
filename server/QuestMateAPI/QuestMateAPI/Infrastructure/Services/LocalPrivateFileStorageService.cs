using QuestMateAPI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace QuestMateAPI.Infrastructure.Services
{
    public class LocalPrivateFileStorageService : IFileStorageService
    {
        private readonly string _rootPath;
        private readonly IWebHostEnvironment _env;

        public LocalPrivateFileStorageService(IConfiguration config, IWebHostEnvironment env)
        {
            _env = env;
            var cfg = config["PrivateStorage:RootPath"] ?? "PrivateFiles";
            if (Path.IsPathRooted(cfg))
            {
                _rootPath = cfg;
            }
            else
            {
                _rootPath = Path.Combine(_env.ContentRootPath, cfg);
            }

            // ensure folder exists
            if (!Directory.Exists(_rootPath)) Directory.CreateDirectory(_rootPath);
        }

        public async Task<string> SaveAsync(IFormFile file, string subfolder)
        {
            if (file == null) throw new ArgumentNullException(nameof(file));

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext != ".jpg" && ext != ".png" && ext != ".jpeg") throw new InvalidOperationException("INVALID_IMAGE_TYPE");

            string datePath = DateTime.UtcNow.ToString("yyyyMMdd");
            string folder = string.IsNullOrEmpty(subfolder) ? datePath : Path.Combine(subfolder, datePath);
            string fullFolder = Path.Combine(_rootPath, folder);
            if (!Directory.Exists(fullFolder)) Directory.CreateDirectory(fullFolder);

            string uniqueFileName = $"{Guid.NewGuid()}{ext}";
            string fullPath = Path.Combine(fullFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // return stored relative path (relative to rootPath)
            var relative = Path.Combine(folder, uniqueFileName).Replace('\\', '/');
            return relative;
        }

        public Task DeleteAsync(string storedPath)
        {
            if (string.IsNullOrEmpty(storedPath)) return Task.CompletedTask;
            var relative = storedPath.TrimStart('/', '\\');
            var full = Path.Combine(_rootPath, relative.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(full)) File.Delete(full);
            return Task.CompletedTask;
        }

        public Task<Stream?> OpenReadAsync(string storedPath)
        {
            if (string.IsNullOrEmpty(storedPath)) return Task.FromResult<Stream?>(null);
            var relative = storedPath.TrimStart('/', '\\');
            var full = Path.Combine(_rootPath, relative.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(full)) return Task.FromResult<Stream?>(null);
            Stream fs = new FileStream(full, FileMode.Open, FileAccess.Read, FileShare.Read);
            return Task.FromResult<Stream?>(fs);
        }

        public Task<bool> ExistsAsync(string storedPath)
        {
            if (string.IsNullOrEmpty(storedPath)) return Task.FromResult(false);
            var relative = storedPath.TrimStart('/', '\\');
            var full = Path.Combine(_rootPath, relative.Replace('/', Path.DirectorySeparatorChar));
            return Task.FromResult(File.Exists(full));
        }
    }
}
