using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface ISocialAccountRepository
    {
        Task<SocialAccount?> GetByPlatformUserIdAsync(int platform, string platformUserId);
        Task<long> CreateAccountUserAsync(string extraData);
        Task<long> CreateSocialAccountAsync(long accountUserId, int platform, string platformUserId, string accessToken, string refreshToken);
        Task UpdateSocialAccountAsync(string platformUserId, string accessToken, string refreshToken);
        Task UpdateAccountUserLoginDateAsync(long accountUserId);
    }
}
