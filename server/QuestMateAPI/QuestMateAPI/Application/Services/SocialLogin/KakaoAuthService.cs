using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using QuestMateAPI.Application.Models.Auth;

namespace QuestMateAPI.Application.Services.SocialLogin
{
    public interface IKakaoAuthService
    {
        string GetLoginUrl();
        Task<KakaoToken?> GetTokenAsync(string code);
        Task<KakaoProfile?> GetProfileAsync(string accessToken);
    }

    public class KakaoAuthService : IKakaoAuthService
    {
        public class KakaoLoginOptions
        {
            public string ClientId { get; set; } = string.Empty;
            public string ClientSecret { get; set; } = string.Empty;
            public string RedirectUri { get; set; } = string.Empty;
        }

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        string? _clientId = string.Empty;
        string? _clientSecret = string.Empty;
        string? _redirectUri = string.Empty;

        public KakaoAuthService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;

            // Kakao 로그인 옵션
            _clientId = config["KakaoLogin:ClientId"];
            _clientSecret = config["KakaoLogin:ClientSecret"];
            _redirectUri = config["KakaoLogin:RedirectUri"];
        }

        public string GetLoginUrl()
        {
            string url = $"https://kauth.kakao.com/oauth/authorize?response_type=code&client_id={_clientId}&redirect_uri={_redirectUri}";
            return url;
        }

        public async Task<KakaoToken?> GetTokenAsync(string code)
        {
            if (_clientId == null || _redirectUri == null)
            {
                return null;
            }

            // Get client secret from AWS Secrets Manager if available, otherwise use config
            var clientSecret = _clientSecret;

            var parameters = new Dictionary<string, string>
                {
                    { "grant_type", "authorization_code" },
                    { "client_id", _clientId },
                    { "redirect_uri", _redirectUri },
                    { "code", code }
                };
            if (!string.IsNullOrEmpty(clientSecret))
                parameters.Add("client_secret", clientSecret);

            var response = await _httpClient.PostAsync("https://kauth.kakao.com/oauth/token", new FormUrlEncodedContent(parameters));
            string content = await response.Content.ReadAsStringAsync();

            Console.WriteLine("content:" + content);

            KakaoToken? kakaoToken = JsonSerializer.Deserialize<KakaoToken>(
                content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return kakaoToken;
        }

        public async Task<KakaoProfile?> GetProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var userResponse = await _httpClient.GetStringAsync("https://kapi.kakao.com/v2/user/me");

            Console.WriteLine("kakao profile:" + userResponse);

            // 실제 데이터
            //kakao profile:{"id":123456,"connected_at":"2025-09-20T15:16:15Z"}

            return JsonSerializer.Deserialize<KakaoProfile>(
                userResponse,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
        }
    }

}
