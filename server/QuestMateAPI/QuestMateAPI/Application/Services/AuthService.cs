using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.Interfaces;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Repositories;
using System.Security.Claims;
using QuestMateAPI.Application.DTOs.User;

namespace QuestMateAPI.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly ILocalAccountRepository _localAccountRepo;
        private readonly IUserRepository _userRepo;
        private readonly ISocialAccountRepository _socialAccountRepo;
        private readonly IRefreshTokenRepository _refreshTokenRepo;

        private readonly JwtTokenGenerator _jwt;

        public AuthService(
            ILocalAccountRepository localAccountRepo,
            IUserRepository userRepo,
            ISocialAccountRepository socialAccountRepo,
            IRefreshTokenRepository refreshTokenRepo,
            JwtTokenGenerator jwt)
        {
            _localAccountRepo = localAccountRepo;
            _userRepo = userRepo;
            _socialAccountRepo = socialAccountRepo;
            _refreshTokenRepo = refreshTokenRepo;
            _jwt = jwt;
        }

        public async Task<LoginResultDto> LoginAsync(LoginRequestDto request)
        {
            // 1. 계정 조회
            var account = await _localAccountRepo.GetByEmailAsync(request.Email);
            if (account == null)
            {
                return new LoginResultDto
                {
                    Success = false,
                    Error = "ACCOUNT_NOT_FOUND"
                };
            }

            // 2. 비밀번호 검증
            var hash = PasswordHasher.Hash(request.Password, account.Salt);
            if (hash != account.PasswordHash)
            {
                return new LoginResultDto
                {
                    Success = false,
                    Error = "INVALID_PASSWORD"
                };
            }

            // 3. 로그인 날짜 업데이트
            await _userRepo.UpdateLoginDateAsync(account.UserId);

            // 4. refresh token 생성
            string refreshTokenStr = RefreshTokenGenerator.GenerateRefreshToken();
            RefreshToken refreshToken = new RefreshToken
            {
                UserId = account.UserId,
                Token = refreshTokenStr,
                ExpiresAt = DateTime.UtcNow.AddDays(30), // 30일 유효
                CreatedAt = DateTime.UtcNow,
            };
            await _refreshTokenRepo.CreateAsync(refreshToken);

            // 성공
            return new LoginResultDto
            {
                Success = true,
                UserId = account.UserId,
                AccessToken = _jwt.GenerateAccessToken(account.UserId),
                RefreshToken = refreshTokenStr
            };
        }

        public async Task<LogoutResultDto> LogoutAsync(LogoutRequestDto request, long userId)
        {
            try
            {
                // 추후 구현: Refresh Token 삭제 로직
                // await _repository.RemoveRefreshTokenAsync(userId, request.RefreshToken);

                // 4. 표준 로거 사용 (날짜, 스레드ID 등 자동 포함됨)
                //_logger.LogInformation("User {UserId} logged out successfully.", userId);

                return new LogoutResultDto
                {
                    Success = true
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Logout failed for user {UserId}", userId);
                return new LogoutResultDto
                {
                    Success = false,
                    Error = "INTERNAL_SERVER_ERROR"
                };
            }
        }

        public async Task<SignUpResultDto> SignUpAsync(SignUpRequestDto request)
        {
            // 1. 이메일 중복 체크
            var existing = await _localAccountRepo.GetByEmailAsync(request.Email);
            if (existing != null)
            {
                return new SignUpResultDto
                {
                    Success = false,
                    Error = "EMAIL_ALREADY_EXISTS"
                };
            }

            // 2. user 생성
            var userId = await _userRepo.CreateAsync();

            // 3. salt + hash
            var salt = SaltGenerator.Generate();
            var hash = PasswordHasher.Hash(request.Password, salt);

            // 4. local_account 생성
            var account = new LocalAccount
            {
                UserId = userId,
                Email = request.Email,
                PasswordHash = hash,
                Salt = salt
            };

            await _localAccountRepo.CreateAsync(account);

            return new SignUpResultDto
            {
                Success = true,
                UserId = account.UserId,
                AccessToken = _jwt.GenerateAccessToken(account.UserId)
            };
        }

        public async Task<RefreshTokenResultDto> RefreshToken(RefreshTokenRequestDto request)
        {
            // 1. refresh token 조회
            var refreshToken = await _refreshTokenRepo.GetValidTokenAsync(request.RefreshToken);

            if (refreshToken == null)
            {
                return new RefreshTokenResultDto
                {
                    Success = false,
                    Error = "INVALID_REFRESH_TOKEN"
                };
            }

            // 2. Access Token 재발급
            var accessToken = _jwt.GenerateAccessToken(refreshToken.UserId);

            return new RefreshTokenResultDto
            {
                Success = true,
                AccessToken = accessToken,
                ExpiresIn = _jwt._options.AccessTokenMinutes * 60
            };
        }

        public async Task<UserDto?> GetMyInfoAsync(long userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                AvatarNumber = user.AvatarNumber,
                Nickname = user.Nickname
            };
        }

        public async Task<LoginResultDto> CreateGuestAsync()
        {
            // 1. create user with random avatar and reserved nickname
            int avatarNumber = Random.Shared.Next(0, 40 + 1);

            var (userId, nickname) = await _socialAccountRepo.CreateAccountUserAsync(avatarNumber);

            // 2. create social account entry for guest
            var platformUserId = Guid.NewGuid().ToString();
            var socialAccountId = await _socialAccountRepo.CreateSocialAccountAsync(
                userId,
                (int)PlatformDefine.Guest,
                platformUserId,
                string.Empty,
                string.Empty
            );

            // 3. create refresh token
            string refreshTokenStr = RefreshTokenGenerator.GenerateRefreshToken();
            RefreshToken refreshToken = new RefreshToken
            {
                UserId = userId,
                Token = refreshTokenStr,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow
            };

            await _refreshTokenRepo.CreateAsync(refreshToken);

            // 4. generate access token
            var accessToken = _jwt.GenerateAccessToken(userId);

            return new LoginResultDto
            {
                Success = true,
                UserId = userId,
                AccessToken = accessToken,
                RefreshToken = refreshTokenStr,
                AvatarNumber = avatarNumber,
                Nickname = nickname
            };
        }
    }
}
