using Dapper;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Db;

namespace QuestMateAPI.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DapperContext _context;

    public UserRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(long id)
    {
        const string sql = @"
            SELECT *
            FROM user
            WHERE id = @id;
        ";

        using var conn = _context.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { id });
    }

    public async Task<long> CreateAsync()
    {
        const string sql = @"
            INSERT INTO user ()
            VALUES ();

            SELECT LAST_INSERT_ID();
        ";

        using var conn = _context.CreateConnection();
        return await conn.ExecuteScalarAsync<long>(sql);
    }

    public async Task UpdateLoginDateAsync(long userId)
    {
        const string sql = @"
            UPDATE user
            SET login_date = NOW()
            WHERE id = @userId;
        ";

        using var conn = _context.CreateConnection();
        await conn.ExecuteAsync(sql, new { userId });
    }
}
