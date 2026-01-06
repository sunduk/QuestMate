using QuestMateAPI.Application.DTOs.Quest;

namespace QuestMateAPI.Application.DTOs.Avatar
{
    public interface IAvatarService
    {
        Task<ChangeAvatarResultDto> ChangeAvatarAsync(long userId, ChangeAvatarRequestDto dto);
    }
}
