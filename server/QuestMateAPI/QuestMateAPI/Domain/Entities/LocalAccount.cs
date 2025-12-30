namespace QuestMateAPI.Domain.Entities
{
    public class LocalAccount
    {
        public long Id { get; set; }
        public long UserId { get; set; }

        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Salt { get; set; } = null!;

        public DateTime RegDate { get; set; }
        public DateTime LoginDate { get; set; }
    }
}
