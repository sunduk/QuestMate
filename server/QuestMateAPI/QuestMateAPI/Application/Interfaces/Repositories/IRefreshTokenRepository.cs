using QuestMateAPI.Domain.Entities;

namespace QuestMateAPI.Application.Interfaces.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetValidTokenAsync(string token);
        Task<long> CreateAsync(RefreshToken refreshToken);
        Task RevokeAsync(long id);
    }
}
