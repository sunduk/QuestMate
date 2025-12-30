using Dapper;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Db;
using QuestMateAPI.Application.Interfaces.Repositories;

namespace QuestMateAPI.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly DapperContext _context;

        public RefreshTokenRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetValidTokenAsync(string token)
        {
            const string sql = """
            SELECT *
            FROM refresh_token
            WHERE token = @Token
              AND expires_at > NOW()
              AND revoked_at IS NULL
            LIMIT 1
        """;

            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<RefreshToken>(
                sql,
                new { token }
            );
        }

        public async Task<long> CreateAsync(RefreshToken refreshToken)
        {
            const string sql = """
            INSERT INTO refresh_token
            (user_id, token, expires_at)
            VALUES (@UserId, @Token, @ExpiresAt);
            SELECT LAST_INSERT_ID();
        """;

            using var connection = _context.CreateConnection();
            return await connection.ExecuteScalarAsync<long>(sql, refreshToken);
        }

        public async Task RevokeAsync(long id)
        {
            const string sql = """
            UPDATE refresh_token
            SET revoked_at = NOW()
            WHERE id = @Id
        """;

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { id });
        }
    }
}
