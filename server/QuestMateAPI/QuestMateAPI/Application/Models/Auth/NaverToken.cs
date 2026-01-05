using System.Text.Json.Serialization;

namespace QuestMateAPI.Application.Models.Auth
{
    public class NaverToken
    {
        public string access_token { get; set; } = string.Empty;
        public string refresh_token { get; set; } = string.Empty;
        public string token_type { get; set; } = string.Empty;

        // json string -> int로 파싱하기 위해 넣음.
        [JsonConverter(typeof(StringToIntConverter))]
        public int expires_in { get; set; }
    }
}
