namespace QuestMateAPI.Application.DTOs.Auth
{
    public class SignUpRequestDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
