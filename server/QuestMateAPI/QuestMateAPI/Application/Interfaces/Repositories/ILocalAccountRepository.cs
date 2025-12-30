using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface ILocalAccountRepository
    {
        Task<LocalAccount?> GetByEmailAsync(string email);
        Task CreateAsync(LocalAccount account);
    }
}
