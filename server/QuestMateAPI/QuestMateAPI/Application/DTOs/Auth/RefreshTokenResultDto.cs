namespace QuestMateAPI.Application.DTOs.Auth
{
    public class RefreshTokenResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }

        public string AccessToken { get; set; } = null!;
        public string? RefreshToken { get; set; } // rotation 시만 내려줌
        public int ExpiresIn { get; set; }
    }
}
