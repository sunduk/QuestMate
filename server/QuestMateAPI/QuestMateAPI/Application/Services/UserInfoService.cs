using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Interfaces.Services;
using QuestMateAPI.Application.DTOs.User;

namespace QuestMateAPI.Application.Services
{
    public class UserInfoService : IUserInfoService
    {
        private readonly ISocialAccountRepository _socialRepo;
        private readonly IUserRepository _userRepo;

        public UserInfoService(ISocialAccountRepository socialRepo, IUserRepository userRepo)
        {
            _socialRepo = socialRepo;
            _userRepo = userRepo;
        }

        public async Task<ChangeNicknameResultDto?> UpdateNicknameAsync(long userId, string nickname)
        {
            // optional: validate nickname length/characters
            if (string.IsNullOrWhiteSpace(nickname) || nickname.Length > 30) return null;

            // update user table
            await _socialRepo.UpdateAccountNicknameByUserIdAsync(userId, nickname);

            return new ChangeNicknameResultDto { Nickname = nickname };
        }
    }
}
