using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Repositories;

namespace QuestMateAPI.Application.Services.SocialLogin
{
    public interface ICommonAuthService
    {
        Task<SocialAccount> SaveOrUpdateUserAsync(PlatformDefine platform, string accessToken, string refreshToken, string platformUserId);
    }

    public class CommonAuthService : ICommonAuthService
    {
        private readonly ISocialAccountRepository _repository;

        public CommonAuthService(ISocialAccountRepository repository)
        {
            _repository = repository;
        }

        public async Task<SocialAccount> SaveOrUpdateUserAsync(PlatformDefine platform, string accessToken, string refreshToken, string platformUserId)
        {
            var existingAccount = await _repository.GetByPlatformUserIdAsync((int)platform, platformUserId);

            if (existingAccount == null)
            {
                // 신규 사용자 생성
                int avatarNumber = Random.Shared.Next(0, 40 + 1);

                // 닉네임 생성 규칙
                // 1. 미리 정의해놓은 목록에서 랜덤 선택
                // 2. 생성된 계정 ID를 36진수로 변환하여 뒤에 붙이기
                string[] namePool = new[]
                {
                    "조용한날",
                    "오늘한걸음",
                    "느린하루",
                    "잔잔한빛",
                    "작은기록",
                    "따뜻한밤",
                    "가벼운마음",
                    "하루메모",
                    "여백의날",
                    "그날의나",
                    "오늘의나",
                    "비밀노트",
                    "하루기록",
                    "소소한날",
                    "마음한줄",
                    "조용한방",
                    "내얘기",
                    "작은일기",
                    "그날의기분",
                    "숨긴마음",
                    "오늘기록",
                    "하루정리",
                    "묵묵한날",
                    "조용한사람",
                    "기록하는중",
                    "그냥하루",
                    "평범한날",
                    "마음정리",
                    "일상의메모",
                    "하루반성",
                    "오늘도출발",
                    "밖으로한걸음",
                    "사람속으로",
                    "기분업중",
                    "하루시작",
                    "만나고옴",
                    "움직이는중",
                    "밖이좋아",
                    "에너지충전",
                    "웃으며기록",
                    "조용한기록",
                    "혼자한줄",
                    "내속도대로",
                    "말없는날",
                    "천천히적기",
                    "생각메모",
                    "작은하루",
                    "조용히남김",
                    "내일기장",
                    "한쪽페이지",
                };

                var baseName = namePool[Random.Shared.Next(namePool.Length)];

                // 임시 닉네임으로 먼저 계정 생성 (닉네임은 추후 업데이트)
                var provisionalNickname = baseName;
                var userId = await _repository.CreateAccountUserAsync(avatarNumber, provisionalNickname);

                // ID를 36진수로 변환하여 고유 접미사 생성
                static string ToBase36(long value)
                {
                    const string chars = "0123456789abcdefghijklmnopqrstuvwxyz";
                    if (value == 0) return "0";
                    var result = string.Empty;
                    while (value > 0)
                    {
                        var idx = (int)(value % 36);
                        result = chars[idx] + result;
                        value /= 36;
                    }
                    return result;
                }

                var suffix = ToBase36(userId);
                var finalNickname = $"{baseName}{suffix}";

                // 닉네임을 최종값으로 업데이트
                await _repository.UpdateAccountNicknameAsync(userId, finalNickname);

                var socialAccountId = await _repository.CreateSocialAccountAsync(
                    userId,
                    (int)platform,
                    platformUserId,
                    accessToken,
                    refreshToken
                );

                return new SocialAccount
                {
                    Id = socialAccountId,
                    UserId = userId,
                    Platform = platform.ToString(),
                    PlatformUserId = platformUserId,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    RegDate = DateTime.UtcNow,
                    LoginDate = DateTime.UtcNow,
                    AvatarNumber = avatarNumber,
                    Nickname = finalNickname
                };
            }
            else
            {
                // 기존 사용자 업데이트
                if (string.IsNullOrEmpty(refreshToken))
                {
                    refreshToken = existingAccount.RefreshToken ?? string.Empty;
                }

                await _repository.UpdateSocialAccountAsync(platformUserId, accessToken, refreshToken);
                await _repository.UpdateAccountUserLoginDateAsync(existingAccount.UserId);
                SocialAccount? socialAccount = await _repository.GetByPlatformUserIdAsync((int)platform, platformUserId);

                existingAccount.AccessToken = accessToken;
                existingAccount.RefreshToken = refreshToken;
                existingAccount.LoginDate = DateTime.UtcNow;
                existingAccount.AvatarNumber = socialAccount?.AvatarNumber;
                existingAccount.Nickname = socialAccount?.Nickname;

                Console.WriteLine($"Updated SocialAccount: Id={existingAccount.Id}, UserId={existingAccount.UserId}");

                return existingAccount;
            }
        }
    }
}