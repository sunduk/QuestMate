20년차 게임 개발자님의 시각에 맞춰, 지금까지 우리가 확립한 **Frontend(Next.js) 코딩 규칙(Convention)**을 정리해 드립니다.

이 규칙들은 **"유지보수성"**과 **"앱 같은 사용성(UX)"**을 위해 정해진 약속들입니다.

---

## 📜 QuestMate 프론트엔드 코딩 규칙 (v1.0)

### 1. 레이아웃 구조 (Layout System)
**"UI 껍데기(Frame)와 알맹이(Page)의 역할 분리"**

*   **구조:** `MobileFrame`이 전체 화면(`h-screen`)을 잡고, 상단바/하단바를 고정합니다.
*   **Page의 역할:** `page.tsx`는 **스크롤 가능한 컨텐츠 영역**만 담당합니다.
*   **스크롤 처리:**
    *   `MobileFrame`은 절대 늘어나지 않음 (`overflow-hidden`).
    *   `page.tsx` 내부에서 **`absolute inset-0 overflow-y-auto`** 패턴을 사용하여 독립적인 스크롤 영역을 생성.
*   **고정 UI (FAB 등):**
    *   스크롤되면 안 되는 버튼(+ 버튼 등)은 스크롤 `div`의 **형제(Sibling)**로 배치하여 화면에 고정.

```tsx
// Page 구조 표준
export default function SomePage() {
  return (
    <div className="relative h-full w-full">
      {/* 1. 스크롤 영역 */}
      <div className="absolute inset-0 overflow-y-auto px-6 pb-24">
         {/* 컨텐츠... */}
      </div>

      {/* 2. 고정 버튼 (필요 시) */}
      <button className="absolute bottom-6 right-6 ..."> + </button>
    </div>
  );
}
```

---

### 2. 데이터 흐름 (Data Flow)
**"서버 패킷(DTO)을 UI 모델(ViewModel)로 변환"**

*   **Raw Data 금지:** 서버에서 온 DTO(`category: 0`, `status: 1`)를 그대로 렌더링에 쓰지 않습니다.
*   **ViewModel 매핑:** 반드시 컴포넌트 내부(또는 유틸 함수)에서 **UI용 데이터로 변환** 후 `useState`에 담습니다.
    *   예: `0` → `"운동"`, `IsHost` → `(나)` 텍스트 추가, 이모지 매핑 등.
*   **이유:** 서버 데이터 구조가 바뀌어도 변환 로직만 고치면 UI 코드는 건드릴 필요가 없습니다. (의존성 분리)

---

### 3. 상태 관리 (State Management)
**"전역은 Zustand, 지역은 useState"**

*   **Zustand (GameManager):**
    *   앱 전체에서 공유하는 데이터 (내 정보, 토큰, 환경설정).
    *   새로고침 시 유지가 필요한 데이터 (`persist` 미들웨어 사용).
*   **useState (Local Variable):**
    *   특정 페이지 안에서만 쓰는 데이터 (입력 폼, 로딩 상태, 모달 열림 여부).
*   **Prop Drilling 금지:** 부모->자식->자식->자식으로 데이터를 넘기지 말고, 필요하면 Zustand에서 바로 꺼내 씁니다.

---

### 4. 네트워크 통신 (Network Layer)
**"직접 호출 금지, 매니저 경유"**

*   **인스턴스 사용:** `import axios` 대신 **`import api from "@/lib/axios"`**를 사용합니다.
    *   알아서 `BaseURL` 붙여주고, 헤더에 `Token` 넣어줍니다.
*   **경로 규칙:** `/api` 프리픽스는 생략합니다. (예: `api.post("/quest/join")`)
*   **로딩/에러 처리:**
    *   모든 통신은 `try-catch`로 감싸고, `finally`에서 로딩 상태(`isLoading`)를 해제합니다.
    *   에러 처리는 `isAxiosError` 가드를 사용하여 안전하게 메시지를 파싱합니다.

---

### 5. Next.js 15 특화 규칙
**"Client Component 명시"**

*   **"use client":**
    *   `useState`, `useEffect`, `onClick` 같은 **상호작용**이 있는 모든 페이지 최상단에는 `"use client";`를 명시합니다. (사실상 거의 모든 `page.tsx`에 붙습니다.)
*   **URL 파라미터:**
    *   `params`는 **Promise**입니다. 반드시 `React.use()` 훅을 사용하여 언랩핑(Unwrap) 후 ID를 꺼냅니다.

---

### 6. 디렉토리 구조 (Directory Structure)

```text
src/
├── app/                 # 라우팅 (페이지들)
│   ├── login/page.tsx
│   ├── quests/
│   │   ├── page.tsx     # 목록
│   │   └── [id]/page.tsx # 상세
│   └── layout.tsx       # 전체 공통 레이아웃
├── components/          # 재사용 컴포넌트
│   ├── layout/          # MobileFrame, TopBar, BottomNav
│   └── ui/              # 버튼, 카드 등 조각 UI
├── lib/                 # 유틸리티 & 설정
│   └── axios.ts         # 네트워크 매니저
└── store/               # 상태 관리
    └── useAuthStore.ts  # 유저 세션 매니저
```

이 규칙들만 지키시면, 남은 기간 동안 코드가 꼬이지 않고 **"일관성 있는 게임 같은 웹 앱"**을 완성하실 수 있습니다!