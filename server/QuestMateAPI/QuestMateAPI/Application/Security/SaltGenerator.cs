using System.Security.Cryptography;

namespace QuestMateAPI.Application.Security
{
    public static class SaltGenerator
    {
        public static string Generate()
        {
            var bytes = RandomNumberGenerator.GetBytes(16);
            return Convert.ToHexString(bytes).ToLower();
        }
    }
}
