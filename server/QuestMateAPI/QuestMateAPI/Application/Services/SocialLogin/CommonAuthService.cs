using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Models.UserData;
using QuestMateAPI.Domain.Entities;

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
                // create extra data from UserExtraData.
                UserExtraData extraData = new UserExtraData
                {
                    avatarNumber = Random.Shared.Next(0, 40 + 1)
                };

                // convert extraData to JSON string
                string extraDataJson = System.Text.Json.JsonSerializer.Serialize(extraData);

                var userId = await _repository.CreateAccountUserAsync(extraDataJson);
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
                    ExtraData = extraData
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

                existingAccount.AccessToken = accessToken;
                existingAccount.RefreshToken = refreshToken;
                existingAccount.LoginDate = DateTime.UtcNow;

                Console.WriteLine($"Updated SocialAccount: Id={existingAccount.Id}, UserId={existingAccount.UserId}");

                return existingAccount;
            }
        }
    }
}