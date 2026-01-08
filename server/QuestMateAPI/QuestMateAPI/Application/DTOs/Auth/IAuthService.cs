using QuestMateAPI.Application.DTOs.User;

namespace QuestMateAPI.Application.DTOs.Auth
{
    public interface IAuthService
    {
        Task<LoginResultDto> LoginAsync(LoginRequestDto request);
        Task<LogoutResultDto> LogoutAsync(LogoutRequestDto request, long userId);
        Task<SignUpResultDto> SignUpAsync(SignUpRequestDto request);
        Task<RefreshTokenResultDto> RefreshToken(RefreshTokenRequestDto request);
        Task<UserDto?> GetMyInfoAsync(long userId);
        Task<LoginResultDto> CreateGuestAsync();
    }
}
