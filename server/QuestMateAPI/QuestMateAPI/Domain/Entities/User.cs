namespace QuestMateAPI.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public DateTime RegDate { get; set; }
    public DateTime? LoginDate { get; set; }
}
