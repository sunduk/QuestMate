using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(long id);
        Task<long> CreateAsync();
        Task UpdateLoginDateAsync(long userId);
        Task UpdateAvatarAsync(long userId, int avatarNumber);
    }
}
