using System.Text;
using System.Security.Cryptography;

namespace QuestMateAPI.Application.Security
{
    public static class PasswordHasher
    {
        public static string Hash(string password, string salt)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password + salt);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToHexString(hash).ToLower();
        }
    }
}
