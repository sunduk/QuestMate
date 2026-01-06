using Dapper;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Db;

namespace QuestMateAPI.Infrastructure.Repositories
{
    public class SocialAccountRepository : ISocialAccountRepository
    {
        private readonly DapperContext _context;

        public SocialAccountRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<SocialAccount?> GetByPlatformUserIdAsync(int platform, string platformUserId)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                SELECT 
                    sa.id AS Id,
                    sa.user_id AS UserId,
                    sa.platform AS Platform,
                    sa.platform_user_id AS PlatformUserId,
                    sa.access_token AS AccessToken,
                    sa.refresh_token AS RefreshToken,
                    sa.reg_date AS RegDate,
                    sa.login_date AS LoginDate,
                    u.avatar_number as AvatarNumber,
                    u.nickname as Nickname
                FROM social_account sa
                LEFT JOIN user u ON sa.user_id = u.id
                WHERE sa.platform = @Platform AND sa.platform_user_id = @PlatformUserId";

            return await conn.QuerySingleOrDefaultAsync<SocialAccount>(sql, new { Platform = platform, PlatformUserId = platformUserId });
        }

        public async Task<long> CreateAccountUserAsync(int avatarNumber, string nickname)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                INSERT INTO User (reg_date, login_date, avatar_number, nickname) 
                VALUES (UTC_TIMESTAMP(), UTC_TIMESTAMP(), @AvatarNumber, @Nickname);
                SELECT LAST_INSERT_ID();";

            return await conn.ExecuteScalarAsync<long>(sql, new { avatarNumber, nickname });
        }

        public async Task<long> CreateSocialAccountAsync(long accountUserId, int platform, string platformUserId, string accessToken, string refreshToken)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                INSERT INTO social_account 
                (user_id, platform, platform_user_id, access_token, refresh_token, reg_date, login_date) 
                VALUES (@UserId, @Platform, @PlatformUserId, @AccessToken, @RefreshToken, UTC_TIMESTAMP(), UTC_TIMESTAMP());
                SELECT LAST_INSERT_ID();";

            return await conn.ExecuteScalarAsync<long>(sql, new
            {
                UserId = accountUserId,
                Platform = platform,
                PlatformUserId = platformUserId,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        public async Task UpdateSocialAccountAsync(string platformUserId, string accessToken, string refreshToken)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                UPDATE social_account 
                SET access_token = @AccessToken, 
                    refresh_token = @RefreshToken, 
                    login_date = UTC_TIMESTAMP()
                WHERE platform_user_id = @PlatformUserId";

            await conn.ExecuteAsync(sql, new
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                PlatformUserId = platformUserId
            });
        }

        public async Task UpdateAccountUserLoginDateAsync(long accountUserId)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                UPDATE User 
                SET login_date = UTC_TIMESTAMP()
                WHERE id = @UserId";

            await conn.ExecuteAsync(sql, new { UserId = accountUserId });
        }
    }
}
