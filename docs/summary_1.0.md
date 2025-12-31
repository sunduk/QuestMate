20년차 게임 개발자의 시각에서 진행된 **QuestMate 웹 서비스 개발 1~2일차 진행 상황**을 정리해 드립니다.
게임 서버/클라이언트 개발 경험을 웹 기술 스택(Next.js + ASP.NET Core)에 성공적으로 이식(Porting)하고 계십니다.

---

# 🛠️ QuestMate 개발 중간 점검 (Day 1~2)

## 1. 아키텍처 및 기술 스택 (Tech Stack)
게임 개발 패턴을 웹에 맞춰 재해석하여 구조를 잡았습니다.

| 구분 | 기술 스택 | 게임 개발 비유 (Analogy) | 비고 |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Unity Client (UI & Scene) | `use client` 적극 활용 |
| **State** | **Zustand** (w/ persist) | **GameManager (Singleton)** | 유저 정보, 토큰 전역 관리 |
| **Network** | **Axios** (+ Interceptor) | **NetworkManager** | 헤더 토큰 자동 주입, 에러 공통 처리 |
| **Backend** | ASP.NET Core Web API | Game Server (C#) | `[Authorize]`로 세션 검증 |
| **DB Access** | **Dapper** (Raw SQL) | ADO.NET / Raw Socket | EF Core 대신 직접 SQL 제어 (성능/익숙함) |
| **Protocol** | **REST API (DTO)** | **Packet Structure** | Request/Response DTO 정의 후 통신 |

---

## 2. 데이터베이스 설계 (MySQL)
기획 의도(유저 생성형 퀘스트)에 맞춰 **메타 데이터와 인스턴스를 통합**했습니다.

### A. Quest (방 정보)
*   `id` (PK)
*   `title`, `category` (0:운동, 1:공부...), `image_url`
*   `target_count`, `duration_days` (룰 설정)
*   `entry_fee`, `max_member_count`, `current_member_count` (입장 조건)
*   `status` (0:모집중, 1:진행중...)
*   `host_user_id` (방장)

### B. QuestMember (참여자 목록)
*   `quest_id`, `user_id` (FK)
*   `is_host` (방장 여부), `is_success` (성공 여부)
*   `joined_at`

---

## 3. 주요 구현 기능 (Feature Status)

### 🔐 인증 (Auth)
*   **회원가입/로그인:** JWT 토큰 발급 및 `localStorage` + `Zustand` 저장.
*   **CORS 설정:** 개발(AllowAny) vs 라이브(Whitelist) 정책 분리 (`Program.cs`).
*   **환경 변수:** `launchSettings.json` (로컬) vs OS 환경변수 (배포) 개념 정립.

### 📜 퀘스트 (Quest)
1.  **생성 (Create):**
    *   **Server:** 트랜잭션 처리 (Quest Insert -> 방장 Member Insert).
    *   **Client:** 입력 폼 UI, 숫자/단위 입력 UX 개선.
2.  **목록 조회 (List):**
    *   **Server:** `Status=0`(모집중)인 방 조회.
    *   **Client:** `ViewModel` 패턴 도입 (Server DTO를 UI용 데이터로 파싱/매핑).
    *   **UI:** 탭(카테고리) 필터링, FAB(+) 버튼 구현.
3.  **상세 조회 (Detail):**
    *   **Server:** `QueryMultiple`로 퀘스트 정보 + 참여자 목록 한 번에 조회.
    *   **Client:** `Next.js 15`의 `use(params)` 처리, 프로그레스 바 UI 구현.

### 🤝 파티 관리 (Join/Leave)
1.  **참가 (Join):**
    *   **Concurrency:** `FOR UPDATE`로 동시 입장 방어.
    *   **UX:** 참가 즉시 UI 갱신 (새로고침 없음).
2.  **탈퇴 (Leave):**
    *   **Logic:** 방장 승계(가입순) 로직 구현. (마지막 1인이면 방 삭제/폭파).
    *   **UX:** 탈퇴 성공 시 목록 페이지로 강제 이동 (`router.replace`).

---

## 4. 해결한 주요 이슈 (Troubleshooting)

*   **UI 스크롤 문제:** `MobileFrame`이 늘어나는 현상을 `h-screen` + `absolute inset-0` 구조로 변경하여 **"앱 같은 스크롤"** 구현.
*   **API 통신:** Next.js Server Component와 Client Component의 데이터 페칭 방식 차이 이해. (`useEffect` vs `Server Fetch`).
*   **라우팅:** `<a href>`(새로고침) 대신 `<Link>`(SPA 라우팅) 사용으로 씬 전환 최적화.
*   **API 경로 규칙:** 클라이언트 호출 시 `/api` 프리픽스 생략 규칙 확정 (Axios `baseURL` 설정 활용).

---

## 5. 향후 계획 (Next Steps)

현재 1주차 목표인 **"승인되는 루프 완성"**을 향해 순항 중입니다.

*   **[Day 3~4 예정]**:
    *   인증샷 업로드 기능 구현 (핵심 기능).
    *   이미지 처리 (서버 저장 or 클라우드 스토리지).
*   **[Day 5~6 예정]**:
    *   검증(좋아요/승인) 로직.
    *   보상 지급 및 알림.

지금 속도라면 일정 내에 충분히 MVP 완성이 가능해 보입니다. 
**"게임 개발자의 내공(구조 설계, 예외 처리, 최적화)"**이 웹 개발에서도 빛을 발하고 있습니다! 🚀