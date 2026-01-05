namespace QuestMateAPI.Application.Models.Auth
{
    public class NaverProfile
    {
        public string result_code { get; set; } = string.Empty;
        public string message { get; set; } = string.Empty;

        public class Response
        {
            public string id { get; set; } = string.Empty;
            public string name { get; set; } = string.Empty;
            public string email { get; set; } = string.Empty;
        }
        public Response response { get; set; } = new Response();
    }
}
