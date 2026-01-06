using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Repositories;

namespace QuestMateAPI.Application.Services.SocialLogin
{
    public interface ICommonAuthService
    {
        Task<SocialAccount> SaveOrUpdateUserAsync(PlatformDefine platform, string accessToken, string refreshToken, string platformUserId);
    }

    public class CommonAuthService : ICommonAuthService
    {
        private readonly ISocialAccountRepository _repository;

        public CommonAuthService(ISocialAccountRepository repository)
        {
            _repository = repository;
        }

        public async Task<SocialAccount> SaveOrUpdateUserAsync(PlatformDefine platform, string accessToken, string refreshToken, string platformUserId)
        {
            var existingAccount = await _repository.GetByPlatformUserIdAsync((int)platform, platformUserId);

            if (existingAccount == null)
            {
                // 신규 사용자 생성
                int avatarNumber = Random.Shared.Next(0, 40 + 1);
                string nickname = $"User{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

                var userId = await _repository.CreateAccountUserAsync(avatarNumber, nickname);
                var socialAccountId = await _repository.CreateSocialAccountAsync(
                    userId,
                    (int)platform,
                    platformUserId,
                    accessToken,
                    refreshToken
                );

                return new SocialAccount
                {
                    Id = socialAccountId,
                    UserId = userId,
                    Platform = platform.ToString(),
                    PlatformUserId = platformUserId,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    RegDate = DateTime.UtcNow,
                    LoginDate = DateTime.UtcNow,
                    AvatarNumber = avatarNumber,
                    Nickname = nickname
                };
            }
            else
            {
                // 기존 사용자 업데이트
                if (string.IsNullOrEmpty(refreshToken))
                {
                    refreshToken = existingAccount.RefreshToken ?? string.Empty;
                }

                await _repository.UpdateSocialAccountAsync(platformUserId, accessToken, refreshToken);
                await _repository.UpdateAccountUserLoginDateAsync(existingAccount.UserId);
                SocialAccount? socialAccount = await _repository.GetByPlatformUserIdAsync((int)platform, platformUserId);

                existingAccount.AccessToken = accessToken;
                existingAccount.RefreshToken = refreshToken;
                existingAccount.LoginDate = DateTime.UtcNow;
                existingAccount.AvatarNumber = socialAccount?.AvatarNumber;
                existingAccount.Nickname = socialAccount?.Nickname;

                Console.WriteLine($"Updated SocialAccount: Id={existingAccount.Id}, UserId={existingAccount.UserId}");

                return existingAccount;
            }
        }
    }
}