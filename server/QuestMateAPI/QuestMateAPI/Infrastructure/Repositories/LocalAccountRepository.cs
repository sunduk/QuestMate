using Dapper;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Db;

namespace QuestMateAPI.Infrastructure.Repositories
{
    public class LocalAccountRepository : ILocalAccountRepository
    {
        private readonly DapperContext _context;

        public LocalAccountRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<LocalAccount?> GetByEmailAsync(string email)
        {
            const string sql = @"
            SELECT *
            FROM local_account
            WHERE email = @email
            LIMIT 1;
        ";

            using var conn = _context.CreateConnection();
            return await conn.QuerySingleOrDefaultAsync<LocalAccount>(sql, new { email });
        }

        public async Task CreateAsync(LocalAccount account)
        {
            const string sql = @"
            INSERT INTO local_account
            (user_id, email, password_hash, salt)
            VALUES
            (@UserId, @Email, @PasswordHash, @Salt);
        ";

            using var conn = _context.CreateConnection();
            await conn.ExecuteAsync(sql, account);
        }
    }
}