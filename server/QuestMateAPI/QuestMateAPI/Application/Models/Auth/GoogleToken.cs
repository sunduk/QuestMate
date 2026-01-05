using QuestMateAPI.Application.Models;
using QuestMateAPI.Application.Models.Auth;

namespace QuestMateAPI.Application.Models.Auth
{
    public class GoogleToken
    {
        public string access_token { get; set; } = string.Empty;
        public string refresh_token { get; set; } = string.Empty;
        public int expires_in { get; set; }
    }
}