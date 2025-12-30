using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{

    public interface ISocialAccountRepository
    {
        Task<SocialAccount?> GetAsync(string platform, string platformUserId);
        Task CreateAsync(SocialAccount account);
    }
}
