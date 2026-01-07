namespace QuestMateAPI.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public DateTime RegDate { get; set; }
    public DateTime? LoginDate { get; set; }
    public string? extraInfo { get; set; }      // 아바타 번호등 커스텀 유저 json데이터.

    // 추가 필드: DB의 avatar_number, nickname 컬럼과 매핑
    public int? AvatarNumber { get; set; }
    public string? Nickname { get; set; }
}
