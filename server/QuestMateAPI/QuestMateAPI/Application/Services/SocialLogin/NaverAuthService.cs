using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using QuestMateAPI.Application.Models.Auth;

namespace QuestMateAPI.Application.Services.SocialLogin
{
    public interface INaverAuthService
    {
        string GetLoginUrl();
        Task<NaverToken?> GetTokenAsync(string code, string state);
        Task<NaverProfile?> GetProfileAsync(string accessToken);
    }

    public class NaverAuthService : INaverAuthService
    {
        public class NaverLoginOptions
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

        public NaverAuthService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;

            // Naver 로그인 옵션
            _clientId = config["NaverLogin:ClientId"];
            _clientSecret = config["NaverLogin:ClientSecret"];
            _redirectUri = config["NaverLogin:RedirectUri"];
        }

        public string GetLoginUrl()
        {
            string state = Guid.NewGuid().ToString("N"); // CSRF 방지용
            string url = $"https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id={_clientId}&redirect_uri={_redirectUri}&state={state}";
            return url;
        }

        public async Task<NaverToken?> GetTokenAsync(string code, string state)
        {
            // Get client secret from AWS Secrets Manager if available, otherwise use config
            var clientSecret = _clientSecret;
            
            var tokenUrl =
                $"https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id={_clientId}&client_secret={clientSecret}&code={code}&state={state}";

            var tokenResponse = await _httpClient.GetStringAsync(tokenUrl);

            return JsonSerializer.Deserialize<NaverToken>(
                tokenResponse,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
        }

        public async Task<NaverProfile?> GetProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var userResponse = await _httpClient.GetStringAsync("https://openapi.naver.com/v1/nid/me");

            return JsonSerializer.Deserialize<NaverProfile>(
                userResponse,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
        }
    }

}
