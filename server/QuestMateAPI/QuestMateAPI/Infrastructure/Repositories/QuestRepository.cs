using Dapper;
using MySqlConnector;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Domain.Entities;
using QuestMateAPI.Infrastructure.Db;
using System.Diagnostics;

namespace QuestMateAPI.Infrastructure.Repositories
{
    public class QuestRepository : IQuestRepository
    {
        private readonly DapperContext _context;

        public QuestRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<long?> CreateQuestAsync(long hostUserId, CreateQuestRequestDto dto)
        {
            using var conn = _context.CreateConnection();

            // 2. Open (트랜잭션을 써야 하므로 명시적으로 엽니다)
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            // 3. 트랜잭션 시작
            using var trans = conn.BeginTransaction();

            try
            {
                // A. Quest 테이블 Insert
                // LAST_INSERT_ID()로 생성된 방 번호를 바로 가져옵니다.
                var sqlQuest = @"
                INSERT INTO Quest 
                (title, category, target_count, duration_days, entry_fee, max_member_count, image_url, host_user_id, status, current_member_count, created_at, updated_at)
                VALUES 
                (@Title, @Category, @TargetCount, @DurationDays, @EntryFee, @MaxMemberCount, @ImageUrl, @HostUserId, 0, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP());
                
                SELECT LAST_INSERT_ID();";

                // Dapper의 QuerySingleAsync로 ID 반환받기
                var questId = await conn.QuerySingleAsync<long>(sqlQuest, new
                {
                    dto.Title,
                    dto.Category,
                    dto.TargetCount,
                    dto.DurationDays,
                    dto.EntryFee,
                    dto.MaxMemberCount,
                    dto.ImageUrl,
                    HostUserId = hostUserId
                }, transaction: trans);

                // B. QuestMember 테이블 Insert (방장을 멤버로 자동 추가)
                var sqlMember = @"
                INSERT INTO QuestMember 
                (quest_id, user_id, is_host, is_success, joined_at)
                VALUES 
                (@QuestId, @UserId, 1, 0, UTC_TIMESTAMP());";

                await conn.ExecuteAsync(sqlMember, new
                {
                    QuestId = questId,
                    UserId = hostUserId
                }, transaction: trans);

                // C. 커밋
                await trans.CommitAsync();

                return questId;
            }
            catch
            {
                await trans.RollbackAsync();
                throw; // Controller에서 잡아서 처리
            }
        }

        // 2. 목록 조회 (모집중인 것만)
        public async Task<IEnumerable<QuestItemDto>> GetActiveQuestsAsync()
        {
            using var conn = _context.CreateConnection();

            var sql = @"
            SELECT 
                q.id AS Id,
                q.title AS Title,
                q.category AS Category,
                q.duration_days AS DurationDays,
                q.entry_fee AS EntryFee,
                q.current_member_count AS CurrentMemberCount,
                q.max_member_count AS MaxMemberCount,
                q.image_url AS ImageUrl,
                q.status AS Status,
                COALESCE(qm.current_count, 0) AS hostUserVerificationCount,
                u.avatar_number AS avatarNumber
            FROM Quest q
            LEFT JOIN QuestMember qm ON q.id = qm.quest_id AND q.host_user_id = qm.user_id
            LEFT JOIN User u ON q.host_user_id = u.id
            WHERE q.status = 0
            ORDER BY q.created_at DESC";

            return await conn.QueryAsync<QuestItemDto>(sql);
        }

        // 상세정보
        public async Task<QuestDetailDto?> GetQuestDetailAsync(long questId, long requestUserId)
        {
            using var conn = _context.CreateConnection();

            // 쿼리 2개 동시 실행 (멀티 리절트)
            // 1. 퀘스트 기본 정보
            // 2. 참여자 목록 (User 테이블과 조인하여 닉네임, 아바타 가져옴)
            var sql = @"
        -- Query 1: Quest Info
        SELECT 
            id, title, category, target_count, duration_days, entry_fee, 
            max_member_count, current_member_count, image_url, status
        FROM Quest
        WHERE id = @QuestId;

        -- Query 2: Participants (Join User)
        SELECT 
            u.id AS UserId,
            NULL AS ProfileImageUrl, -- User 테이블에 컬럼 없으면 NULL 또는 추가 필요
            qm.is_host AS IsHost,
            qm.is_success AS IsSuccess,
            qm.current_count AS CurrentCount, -- 각 유저의 인증 횟수
            u.avatar_number as AvatarNumber,
            u.nickname AS Nickname
        FROM QuestMember qm
        JOIN User u ON qm.user_id = u.id
        WHERE qm.quest_id = @QuestId
        ORDER BY qm.is_host DESC, qm.joined_at ASC; -- 방장 먼저, 그 뒤로 입장순
    ";

            using var multi = await conn.QueryMultipleAsync(sql, new { QuestId = questId });

            // 1. 첫 번째 결과셋 매핑 (QuestDetailDto)
            var quest = await multi.ReadSingleOrDefaultAsync<QuestDetailDto>();

            if (quest == null) return null; // 없는 퀘스트

            // 2. 두 번째 결과셋 매핑 (Participants List)
            var members = (await multi.ReadAsync<QuestParticipantDto>()).ToList();

            // 3. 데이터 조립
            quest.Participants = members;

            // 4. 내가 참여 중인지 확인 (IsJoined 계산)
            // 메모리에 가져온 멤버 리스트에서 내 ID가 있는지 찾음
            quest.IsJoined = members.Any(m => m.UserId == requestUserId);

            return quest;
        }

        public async Task<string> JoinQuestAsync(long questId, long userId)
        {
            using var conn = _context.CreateConnection();
            if (conn.State != System.Data.ConnectionState.Open) conn.Open();

            using var trans = conn.BeginTransaction();

            try
            {
                // 1. 방 상태 및 인원 체크 (Locking Read - FOR UPDATE)
                // 모집중(0)이고, 자리가 남았는지 확인
                var quest = await conn.QuerySingleOrDefaultAsync<dynamic>(@"
            SELECT status, current_member_count, max_member_count, entry_fee 
            FROM Quest 
            WHERE id = @Id 
            FOR UPDATE", // ★ 중요: 내가 처리하는 동안 다른 사람이 건드리지 못하게 락
                    new { Id = questId }, transaction: trans);

                if (quest == null) return "QUEST_NOT_FOUND";
                if (quest.status != 0) return "QUEST_CLOSED"; // 모집중 아님
                if (quest.current_member_count >= quest.max_member_count) return "QUEST_FULL"; // 꽉 참

                // 2. 이미 참여 중인지 체크
                // (UK_Quest_User 제약조건이 있지만, 명시적 에러 메시지를 위해 체크)
                var isJoined = await conn.ExecuteScalarAsync<bool>(@"
            SELECT COUNT(1) FROM QuestMember WHERE quest_id = @QId AND user_id = @UId",
                    new { QId = questId, UId = userId }, transaction: trans);

                if (isJoined) return "ALREADY_JOINED";

                // 3. (추후) 골드 차감 로직
                // int entryFee = quest.entry_fee;
                // if (userGold < entryFee) return "NOT_ENOUGH_GOLD";

                // 4. 멤버 추가
                await conn.ExecuteAsync(@"
            INSERT INTO QuestMember (quest_id, user_id, is_host, is_success, joined_at)
            VALUES (@QId, @UId, 0, 0, UTC_TIMESTAMP())",
                    new { QId = questId, UId = userId }, transaction: trans);

                // 5. 방 인원수 +1 증가
                await conn.ExecuteAsync(@"
            UPDATE Quest 
            SET current_member_count = current_member_count + 1 
            WHERE id = @QId",
                    new { QId = questId }, transaction: trans);

                trans.Commit();
                return null; // 성공 (에러 없음)
            }
            catch (Exception ex)
            {
                trans.Rollback();
                // 로그 남기기
                return "INTERNAL_ERROR";
            }
        }

        public async Task<string> LeaveQuestAsync(long questId, long userId)
        {
            using var conn = _context.CreateConnection();
            if (conn.State != System.Data.ConnectionState.Open) conn.Open();
            using var trans = conn.BeginTransaction();

            try
            {
                // 1. 현재 유저 정보 조회 (방장 여부)
                var member = await conn.QuerySingleOrDefaultAsync<QuestMember>(
                    "SELECT is_host FROM QuestMember WHERE quest_id=@QId AND user_id=@UId",
                    new { QId = questId, UId = userId }, transaction: trans);

                if (member == null) return "NOT_JOINED";

                bool isHost = member.IsHost; // MySQL Boolean(TinyInt)

                // 2. 멤버 삭제 (일단 나를 지움)
                await conn.ExecuteAsync(
                    "DELETE FROM QuestMember WHERE quest_id=@QId AND user_id=@UId",
                    new { QId = questId, UId = userId }, transaction: trans);

                // 3. 인원수 감소
                await conn.ExecuteAsync(
                    "UPDATE Quest SET current_member_count = current_member_count - 1 WHERE id=@QId",
                    new { QId = questId }, transaction: trans);

                // 4. [핵심] 방장이 나갔다면? 승계 or 폭파 로직
                if (isHost)
                {
                    // 남은 멤버 중 가장 오래된 사람 찾기
                    var nextHostUserId = await conn.ExecuteScalarAsync<long?>(@"
                SELECT user_id 
                FROM QuestMember 
                WHERE quest_id = @QId 
                ORDER BY joined_at ASC 
                LIMIT 1",
                        new { QId = questId }, transaction: trans);

                    if (nextHostUserId.HasValue)
                    {
                        // A. 승계 (다음 타자를 방장으로 임명)
                        await conn.ExecuteAsync(
                            "UPDATE QuestMember SET is_host = 1 WHERE quest_id = @QId AND user_id = @NextId",
                            new { QId = questId, NextId = nextHostUserId.Value }, transaction: trans);

                        // Quest 테이블의 HostUserId도 갱신 (메타 데이터 동기화)
                        await conn.ExecuteAsync(
                            "UPDATE Quest SET host_user_id = @NextId WHERE id = @QId",
                            new { QId = questId, NextId = nextHostUserId.Value }, transaction: trans);
                    }
                    else
                    {
                        // B. 폭파 (남은 사람이 없음) -> 퀘스트 삭제 or 실패 처리
                        // 여기서는 '모집중' 상태라면 삭제, '진행중'이라면 실패 처리 등이 필요하지만
                        // MVP 단계에선 일단 Quest 테이블에서 삭제(Soft Delete 추천하지만 일단 Hard Delete)
                        await conn.ExecuteAsync(
                            "DELETE FROM Quest WHERE id = @QId",
                            new { QId = questId }, transaction: trans);
                    }
                }

                trans.Commit();
                return null; // 성공
            }
            catch
            {
                trans.Rollback();
                return "DB_ERROR";
            }
        }

        public async Task<(int currentCount, bool isSuccess)> VerifyQuestAsync(long questId, long userId, string? imageUrl, string? comment)
        {
            using var conn = _context.CreateConnection();
            if (conn.State != System.Data.ConnectionState.Open) conn.Open();
            using var trans = conn.BeginTransaction();

            try
            {
                // 1. 인증 로그 기록 (Insert)
                await conn.ExecuteAsync(@"
            INSERT INTO quest_verification (quest_id, user_id, image_url, comment, status, created_at)
            VALUES (@QId, @UId, @ImgUrl, @Comment, 1, UTC_TIMESTAMP())", // MVP니까 일단 자동 승인(1) 처리
                    new { QId = questId, UId = userId, ImgUrl = imageUrl, Comment = comment },
                    transaction: trans);

                // 2. 내 진행도 증가 (Update)
                await conn.ExecuteAsync(@"
            UPDATE questmember 
            SET current_count = current_count + 1 
            WHERE quest_id = @QId AND user_id = @UId",
                    new { QId = questId, UId = userId },
                    transaction: trans);

                // 3. 목표 달성 여부 체크 (퀘스트 목표와 내 현재 횟수 비교)
                // (게임 로직을 DB 쿼리 안에서 처리)
                var result = await conn.QuerySingleAsync<dynamic>(@"
            SELECT 
                qm.current_count, 
                q.target_count,
                qm.is_success
            FROM questmember qm
            JOIN quest q ON qm.quest_id = q.id
            WHERE qm.quest_id = @QId AND qm.user_id = @UId",
                    new { QId = questId, UId = userId },
                    transaction: trans);

                int currentCount = result.current_count;
                int targetCount = result.target_count;
                bool isSuccess = result.is_success; // MySQL TinyInt

                // 4. 목표 달성 시 성공 처리 (최초 달성 시에만 업데이트)
                if (!isSuccess && currentCount >= targetCount)
                {
                    await conn.ExecuteAsync(@"
                UPDATE questmember SET is_success = 1 
                WHERE quest_id = @QId AND user_id = @UId",
                        new { QId = questId, UId = userId },
                        transaction: trans);

                    isSuccess = true;
                }

                trans.Commit();
                return (currentCount, isSuccess);
            }
            catch
            {
                trans.Rollback();
                throw;
            }
        }

        public async Task<string> DeleteVerificationAsync(long questId, long verificationId, long userId)
        {
            using var conn = _context.CreateConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync();
            using var trans = await conn.BeginTransactionAsync();

            try
            {
                // 1. 인증샷 존재 및 소유권 확인
                var verification = await conn.QuerySingleOrDefaultAsync<QuestVerification>(@"
                    SELECT * FROM quest_verification 
                    WHERE id = @Id AND quest_id = @QId AND user_id = @UId",
                    new { Id = verificationId, QId = questId, UId = userId }, transaction: trans);

                if (verification == null) return "VERIFICATION_NOT_FOUND";

                // 2. 인증샷 삭제
                await conn.ExecuteAsync("DELETE FROM quest_verification WHERE id = @Id",
                    new { Id = verificationId }, transaction: trans);

                // 3. 진행도 감소
                await conn.ExecuteAsync(@"
                    UPDATE questmember 
                    SET current_count = GREATEST(current_count - 1, 0) 
                    WHERE quest_id = @QId AND user_id = @UId",
                    new { QId = questId, UId = userId }, transaction: trans);

                // 4. 성공 상태 재계산 (혹시 목표치 미달로 떨어졌는지 확인)
                var result = await conn.QuerySingleAsync<dynamic>(@"
                    SELECT 
                        qm.current_count, 
                        q.target_count,
                        qm.is_success
                    FROM questmember qm
                    JOIN quest q ON qm.quest_id = q.id
                    WHERE qm.quest_id = @QId AND qm.user_id = @UId",
                    new { QId = questId, UId = userId }, transaction: trans);

                // MySQL에서 boolean은 tinyint(1)로 처리되므로 1/0 체크
                bool isSuccess = result.is_success;
                int currentCount = result.current_count;
                int targetCount = result.target_count;

                if (isSuccess && currentCount < targetCount)
                {
                    await conn.ExecuteAsync(@"
                        UPDATE questmember SET is_success = 0 
                        WHERE quest_id = @QId AND user_id = @UId",
                        new { QId = questId, UId = userId }, transaction: trans);
                }

                await trans.CommitAsync();
                return null; // 성공
            }
            catch
            {
                await trans.RollbackAsync();
                return "DB_ERROR";
            }
        }

        public async Task<QuestVerification?> GetVerificationByIdAsync(long verificationId)
        {
            using var conn = _context.CreateConnection();

            var sql = @"
                SELECT *
                FROM quest_verification
                WHERE id = @Id";

            return await conn.QuerySingleOrDefaultAsync<QuestVerification>(sql, new { Id = verificationId });
        }

        public async Task<string> UpdateVerificationAsync(long questId, long verificationId, long userId, string? comment, string? imageUrl)
        {
            using var conn = _context.CreateConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync();
            using var trans = await conn.BeginTransactionAsync();

            try
            {
                // 1. 인증샷 존재 및 소유권 확인
                var verification = await conn.QuerySingleOrDefaultAsync<QuestVerification>(@"
                    SELECT * FROM quest_verification 
                    WHERE id = @Id AND quest_id = @QId AND user_id = @UId",
                    new { Id = verificationId, QId = questId, UId = userId }, transaction: trans);

                if (verification == null) return "VERIFICATION_NOT_FOUND";

                // 2. 인증샷 수정
                await conn.ExecuteAsync(@"
                    UPDATE quest_verification
                    SET comment = COALESCE(@Comment, comment),
                        image_url = @ImageUrl,
                        created_at = UTC_TIMESTAMP()
                    WHERE id = @Id",
                    new { Id = verificationId, Comment = comment, ImageUrl = imageUrl }, transaction: trans);

                await trans.CommitAsync();
                return null; // 성공
            }
            catch
            {
                await trans.RollbackAsync();
                return "DB_ERROR";
            }
        }

        public async Task<IEnumerable<QuestVerificationDto>> GetQuestVerificationsAsync(long questId)
        {
            using var conn = _context.CreateConnection();
            var sql = @"
                SELECT 
                    qv.id,
                    qv.user_id,
                    qv.image_url,
                    qv.comment,
                    qv.created_at,
                    u.avatar_number
                FROM quest_verification qv
                JOIN user u ON qv.user_id = u.id
                WHERE qv.quest_id = @QuestId
                ORDER BY qv.created_at DESC"; // 최신 인증샷이 먼저 보이도록

            return await conn.QueryAsync<QuestVerificationDto>(sql, new { QuestId = questId });
        }
    }
}
