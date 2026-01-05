using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using QuestMateAPI.Application.Models;
using QuestMateAPI.Application.Models.Auth;
using Dapper;

namespace QuestMateAPI.Application.Services.SocialLogin
{
    public interface IGoogleAuthService
    {
        string GetLoginUrl() => throw new NotImplementedException();
        Task<GoogleToken?> GetTokenAsync(string code) => throw new NotImplementedException();
        Task<GoogleProfile?> GetProfileAsync(string accessToken) => throw new NotImplementedException();
    }

    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        string _clientId = string.Empty;
        string _clientSecret = string.Empty;
        string _redirectUri = string.Empty;

        public GoogleAuthService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
    
            // Google 로그인 옵션
            _clientId = config["GoogleLogin:ClientId"] ?? string.Empty;
            _clientSecret = config["GoogleLogin:ClientSecret"] ?? string.Empty;
            _redirectUri = config["GoogleLogin:RedirectUri"] ?? string.Empty;
        }

        public string GetLoginUrl()
        {
            // Implementation for generating Google login URL
            var redirectUri = _redirectUri ?? "your_redirect_uri";
            var clientId = _clientId ?? "your_client_id";

            // prompt=consent는 매번 로그인 동의창이 떠서 사용자 경험에 안좋으므로 사용하지 않는다.
            // access_type=offline만 사용한다.
            // 이렇게 옵션을 주면 최초 로그인시에만 refresh_token을 받을 수 있기 때문에
            // 받은 직후에 디비에 저장해 놔야 한다.
            return $"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={clientId}&redirect_uri={redirectUri}&scope=openid%20email%20profile&access_type=offline";
        }

        public async Task<GoogleToken?> GetTokenAsync(string code)
        {
            // Implementation for exchanging code for access token
            var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token");
            tokenRequest.Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("code", code),
                new KeyValuePair<string, string>("client_id", _clientId),
                new KeyValuePair<string, string>("client_secret", _clientSecret),
                new KeyValuePair<string, string>("redirect_uri", "http://localhost:3000/auth/google/callback"),
                new KeyValuePair<string, string>("grant_type", "authorization_code")
            });

            var response = await _httpClient.SendAsync(tokenRequest);
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<GoogleToken>(content);
            Console.WriteLine($"Google Token Response: {content}");
            return tokenResponse;
        }

        public async Task<GoogleProfile?> GetProfileAsync(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Google Profile Response: {content}");
            return JsonSerializer.Deserialize<GoogleProfile>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
    }
}