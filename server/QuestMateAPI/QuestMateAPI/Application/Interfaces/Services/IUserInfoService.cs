using QuestMateAPI.Application.DTOs.User;

namespace QuestMateAPI.Application.Interfaces.Services
{
    public interface IUserInfoService
    {
        Task<ChangeNicknameResultDto?> UpdateNicknameAsync(long userId, string nickname);
    }
}
