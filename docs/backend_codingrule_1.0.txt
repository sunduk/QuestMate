20년차 게임 개발자님의 스타일에 맞춰, **ASP.NET Core + Dapper** 백엔드 개발 규칙을 정리해 드립니다.
복잡한 "엔터프라이즈급" 규칙은 다 빼고, **"빠르고, 명확하고, 게임 서버스러운"** 실전 압축 규칙입니다.

---

## 🛡️ QuestMate 백엔드 코딩 규칙 (v1.0)

### 1. 아키텍처 패턴 (Layered Architecture)
**"역할의 철저한 분리 (Separation of Concerns)"**

*   **Controller (Packet Handler):**
    *   HTTP 요청(패킷)을 받아서 파싱하고, 유효성을 검사합니다.
    *   **비즈니스 로직 금지.** 오직 `Service` 호출과 응답 변환만 담당합니다.
*   **Service (Game Logic):**
    *   실제 게임 룰(골드 차감, 레벨업, 권한 체크)을 수행합니다.
    *   여러 Repository를 조합(Transaction)하여 하나의 "기능"을 완성합니다.
    *   `try-catch`로 예외를 잡아 로그를 남기고, `ResultDto`로 포장해서 리턴합니다.
*   **Repository (DB Access Object):**
    *   SQL을 작성하고 DB와 통신합니다.
    *   **로직 금지.** 오직 CRUD(넣고, 빼고, 수정하고, 지우고)만 수행합니다.

---

### 2. 네이밍 규칙 (Naming Convention)
**"C#은 파스칼, DB는 스네이크. 연결은 Dapper가 알아서."**

*   **C# (Class, Property, Method):** `PascalCase`
    *   `QuestService`, `CreateQuestAsync`, `MaxMemberCount`
*   **MySQL (Column):** `snake_case`
    *   `max_member_count`, `is_host`
*   **매핑 전략:**
    *   `Program.cs`에 `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;` 설정을 통해 자동 매핑합니다.
    *   쿼리에서 `AS` 별칭을 쓰지 않아도 됩니다.

---

### 3. DTO & 프로토콜 (Packet Structure)
**"요청과 응답은 명확한 껍데기(Class)로 감싼다."**

*   **구조:** `Request`용 DTO와 `Response`용 DTO를 무조건 분리합니다. (Entity를 그대로 리턴 금지)
*   **Wrapper 패턴:** 모든 응답은 `Success`, `Error` 필드를 포함한 공통 규격을 사용하거나, 각 기능별 ResultDto를 만듭니다.
    ```csharp
    public class QuestDetailResultDto
    {
        public bool Success { get; set; } // 성공 여부 (필수)
        public string? Error { get; set; } // 실패 시 에러 코드
        public QuestDetailDto? Data { get; set; } // 실제 데이터 Payload
    }
    ```
*   **Validation:** `[Required]`, `[Range]` 어트리뷰트를 DTO에 붙여서, 진입 시점에 1차 방어합니다.

---

### 4. 컨트롤러 규칙 (Controller Rules)
**"입구컷과 ID 식별"**

*   **보안:** 로그인이 필요한 API는 반드시 `[Authorize]`를 붙입니다.
*   **User ID 식별:** 클라이언트가 보낸 `body.userId`는 절대 믿지 않습니다. 헤더(토큰)에서 서버가 직접 꺼냅니다.
    ```csharp
    // 표준 패턴
    var userId = long.Parse(User.FindFirst("uid")?.Value ?? "0");
    ```
*   **라우팅:** `[HttpPost("join")]` 처럼 동사나 명사를 명확히 명시합니다. (`api/quest/join`)

---

### 5. 리포지토리 & SQL 규칙 (Repository Rules)
**"SQL은 명시적으로, 트랜잭션은 짧게"**

*   **Connection:** `using var conn = _context.CreateConnection();` 패턴으로, 함수 실행 시 열고 끝나면 즉시 반납합니다.
*   **Transaction:** 2개 이상의 갱신(INSERT + UPDATE)이 일어날 땐 반드시 트랜잭션을 겁니다.
*   **SQL 작성:** `@` (Verbatim String)을 사용하여 여러 줄로 가독성 있게 작성합니다.
    ```csharp
    var sql = @"
        SELECT * 
        FROM Quest 
        WHERE status = 0";
    ```
*   **동시성 제어:** 선착순 입장 등 민감한 로직은 `FOR UPDATE` (비관적 락)를 사용하여 데이터 무결성을 지킵니다.

---

### 6. 비동기 처리 (Async/Await)
**"Blocking 방지 (서버 멈춤 방지)"**

*   **전면 도입:** DB 접근(`QueryAsync`), 서비스 호출, 컨트롤러 액션 등 I/O가 발생하는 모든 곳에 `async/await`를 사용합니다.
*   **반환 타입:** `Task<T>`를 기본으로 합니다.

---

### 7. 디렉토리 구조 (Backend Structure)

```text
QuestMate.Server/
├── Controllers/         # API 진입점 (Packet Handler)
├── Application/         # 비즈니스 로직
│   ├── Interfaces/      # Service 인터페이스 (DI용)
│   └── Services/        # 실제 로직 구현 (Game Logic)
├── Repositories/        # DB 접근 계층 (SQL)
├── Models/              # DB 테이블 엔티티 (Table Schema)
├── DTOs/                # 요청/응답 패킷 구조체
│   ├── Quest/
│   └── Auth/
└── Program.cs           # 서버 설정 (DI 등록, 미들웨어)
```

이 규칙들은 **"유지보수가 쉽고, 혼자 개발해도 코드가 섞이지 않게 하는"** 최소한의 안전장치입니다. 지금까지 아주 잘 지키고 계십니다! 👍