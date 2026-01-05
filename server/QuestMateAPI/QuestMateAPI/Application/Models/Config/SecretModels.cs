namespace QuestMateAPI.Application.Models.Config
{
    public class SocialLoginSecrets
    {
        public string NaverClientSecret { get; set; } = string.Empty;
        public string KakaoClientSecret { get; set; } = string.Empty;
        public string JwtKey { get; set; } = string.Empty;
    }

    public class DatabaseSecrets
    {
        public string ConnectionString { get; set; } = string.Empty;
    }
}