namespace QuestMateAPI.Domain.Entities
{
    public class RefreshToken
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
