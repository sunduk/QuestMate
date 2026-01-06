using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Avatar;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Interfaces;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Repositories;
using System.Security.Claims;

namespace QuestMateAPI.Application.Services
{
    public class AvatarService : IAvatarService
    {
        private readonly ILocalAccountRepository _localAccountRepo;
        private readonly IUserRepository _userRepo;
        private readonly IRefreshTokenRepository _refreshTokenRepo;

        private readonly JwtTokenGenerator _jwt;

        public AvatarService(
            ILocalAccountRepository localAccountRepo,
            IUserRepository userRepo,
            IRefreshTokenRepository refreshTokenRepo,
            JwtTokenGenerator jwt)
        {
            _localAccountRepo = localAccountRepo;
            _userRepo = userRepo;
            _refreshTokenRepo = refreshTokenRepo;
            _jwt = jwt;
        }

        public async Task<ChangeAvatarResultDto> ChangeAvatarAsync(long userId, ChangeAvatarRequestDto dto)
        {
            try
            {
                await _userRepo.UpdateAvatarAsync(userId, dto.AvatarNumber);

                // 5. 성공 응답
                return new ChangeAvatarResultDto
                {
                    Success = true,
                    AvatarNumber = dto.AvatarNumber
                };
            }
            catch (Exception ex)
            {
                // 6. 예외 처리
                //_logger.LogError(ex, "GetQuestDetail Failed. QuestId: {QuestId}", questId);

                return new ChangeAvatarResultDto
                {
                    Success = false,
                    Error = "INTERNAL_SERVER_ERROR"
                };
            }
        }
    }
}
