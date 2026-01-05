using QuestMateAPI.Application.Models;

namespace QuestMateAPI.Application.Models.Auth
{
    // 실제 구글 프로필 데이터.
    //   Google Profile Response: {
    //   "id": "",
    //   "email": "",
    //   "verified_email": true,
    //   "name": "",
    //   "given_name": "",
    //   "family_name": "",
    //   "picture": "https://xxxx"
    //   }

    public class GoogleProfile
    {
        public string id { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public bool verified_email { get; set; }
        public string name { get; set; } = string.Empty;
        public string given_name { get; set; } = string.Empty;
        public string family_name { get; set; } = string.Empty;
        public string picture { get; set; } = string.Empty;
    }
}