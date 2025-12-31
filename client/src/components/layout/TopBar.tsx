"use client";

import { useRouter } from "next/navigation";
import axios from "axios";

export default function TopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. 로컬 스토리지에서 토큰 꺼내기 (PlayerPrefs.GetString 같은 개념)
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("토큰이 없습니다. 이미 로그아웃되었을 수 있습니다.");
        router.replace("/");
        return;
      }

      // 2. 로그아웃 요청
      // axios.post(URL, Body, Config)
      const response = await axios.post(
        "https://localhost:7173/api/auth/logout", 
        {}, // Body: DTO가 비어있어도 JSON 형식은 맞춰야 하므로 빈 객체 전송
        {
          headers: {
            // ★ 핵심: Bearer 토큰 방식 표준 헤더
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2. 응답 데이터 처리 (토큰 & 유저정보)
      // 백엔드에서 { "accessToken": "...", "nickname": "..." } 형태로 준다고 가정
      const { } = response.data; 

      console.log("응답 데이터:", response.data);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // 5. 로컬 스토리지 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.setItem("isLoggedIn", "false");

      // 4. 첫 페이지로 강제 이동
      router.replace("/"); 
    }
  }

  return (
    // sticky top-0: 스크롤해도 상단에 고정
    // z-50: 다른 요소보다 위에 표시 (레이어 순서)
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-slate-800 px-4 text-white shadow-md">
      {/* 왼쪽: 골드 현황 */}
      <div className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1">
        <span className="text-xl">💰</span>
        <span className="font-bold text-yellow-400">999,999 G</span>
      </div>

      {/* 오른쪽: 알림, 설정 */}
      <div className="flex gap-4">
        <button className="text-xl hover:text-yellow-400">🔔</button>
        <button className="text-xl hover:text-yellow-400">⚙️</button>
        <button 
          onClick={handleLogout}
          className="text-xl hover:text-yellow-400"
        >
          🚪
        </button>
      </div>
    </header>
  );
}