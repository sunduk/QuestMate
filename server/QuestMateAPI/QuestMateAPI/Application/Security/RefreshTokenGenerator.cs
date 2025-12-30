using System.Security.Cryptography;

namespace QuestMateAPI.Application.Security
{
    public static class RefreshTokenGenerator
    {
        public static string GenerateRefreshToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        }
    }
}
