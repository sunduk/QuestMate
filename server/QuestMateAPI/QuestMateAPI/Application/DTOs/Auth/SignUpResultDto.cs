namespace QuestMateAPI.Application.DTOs.Auth
{
    public class SignUpResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }

        public long? UserId { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
    }
}
