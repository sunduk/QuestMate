using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // IFormFile을 쓰기 위해 필요

namespace QuestMateAPI.Application.DTOs.Quest
{
    // [요청] 인증샷 업로드 패킷 (Multipart Form)
    public class QuestVerifyRequestDto
    {
        [Required]
        public long QuestId { get; set; }

        public string? Comment { get; set; } // "오늘 운동 완료!" 같은 한마디

        public IFormFile? Image { get; set; } // 업로드된 파일 바이너리 (선택)
    }

    // [응답] 결과 패킷
    public class QuestVerifyResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }

        public string? ImageUrl { get; set; } // 업로드된 이미지 주소 (클라 표시용)
        public int CurrentCount { get; set; } // 갱신된 내 인증 횟수
        public int TargetCount { get; set; }  // 목표 횟수
        public bool IsCompleted { get; set; } // 이번 인증으로 퀘스트 완료(졸업) 했는지?
    }

    // [요청] 인증샷 삭제 요청
    public class QuestVerifyDeleteRequestDto
    {
        [Required]
        public long QuestId { get; set; }

        [Required]
        public long VerificationId { get; set; }
    }

    // [응답] 인증샷 삭제 결과
    public class QuestVerifyDeleteResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
    }

    // [요청] 인증샷 수정 요청
    public class QuestVerifyUpdateRequestDto
    {
        [Required]
        public long QuestId { get; set; }

        [Required]
        public long VerificationId { get; set; }

        public string? Comment { get; set; } // 수정할 코멘트 (선택)

        public IFormFile? Image { get; set; } // 수정할 이미지 파일 (선택)
        public bool RemoveImage { get; set; } // 이미지를 제거할지 여부
    }

    // [응답] 인증샷 수정 결과
    public class QuestVerifyUpdateResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string? UpdatedImageUrl { get; set; } // 수정된 이미지 URL
    }
}