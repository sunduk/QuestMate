namespace QuestMateAPI.Domain.Entities
{
    public class SocialAccount
    {
        public long Id { get; set; }
        public long UserId { get; set; }

        public string Platform { get; set; } = null!;
        public string PlatformUserId { get; set; } = null!;

        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }

        public DateTime RegDate { get; set; }
        public DateTime? LoginDate { get; set; }
    }
}
