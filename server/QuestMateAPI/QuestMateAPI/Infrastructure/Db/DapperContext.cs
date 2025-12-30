using MySqlConnector;

namespace QuestMateAPI.Infrastructure.Db
{
    public class DapperContext
    {
        private readonly string _connectionString;

        public DapperContext(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("Default")!;
        }

        public MySqlConnection CreateConnection()
            => new MySqlConnection(_connectionString);
    }
}
