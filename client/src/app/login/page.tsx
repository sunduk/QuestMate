"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import api from "../../lib/axios"; // 우리가 만든 매니저
import axios from "axios"; // 에러 체크용 정적 함수
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();

  // 스토어 함수 가져오기
  const setAuth = useAuthStore((state) => state.setAuth); 

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 핸들러
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. 로그인 요청 (포트번호 7173 확인)
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      // 2. 응답 데이터 처리 (토큰 & 유저정보)
      // 백엔드에서 { "accessToken": "...", "nickname": "..." } 형태로 준다고 가정
      const { accessToken, userId } = response.data; 

      console.log("응답 데이터:", response.data);

      // 3. 토큰 저장 (Client-side Storage)
      // Unity의 PlayerPrefs처럼 생각하시면 됩니다.
      if (accessToken) {
        localStorage.setItem("isLoggedIn", "true");

        // ★ 여기서 스토어에 저장 (싱글톤 업데이트)
        setAuth({ id: userId, email, nickname: "nickname" }, accessToken);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", userId);

        // (선택) 유저 정보도 간단히 저장하거나 전역 상태(Zustand)에 넣음
        // localStorage.setItem("nickname", nickname || "모험가");
      }

      console.log("로그인 성공! 토큰:", accessToken);

      // 4. 메인 로비(홈)로 이동
      router.push("/"); 

    } catch (error) {
      console.error("로그인 실패:", error);
      setIsLoading(false);
      
      if (axios.isAxiosError(error)) {
         if (error.response?.status === 401) {
             alert("아이디 또는 비밀번호가 일치하지 않습니다.");
         } else {
             alert(`로그인 오류: ${error.response?.data || "서버 응답 없음"}`);
         }
      } else {
          alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 py-8">
      
      {/* 모바일 뷰 컨테이너 */}
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        
        {/* 타이틀 / 로고 영역 */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg text-5xl">
            🗝️
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">QUEST MATE</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">모험을 떠날 준비가 되셨나요?</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-4">
            {/* 이메일 */}
            <div className="relative">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
              />
            </div>

            {/* 비밀번호 */}
            <div className="relative">
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
              />
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-xl py-4 font-bold text-white shadow-lg transition active:scale-95
              ${isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/30"
              }
            `}
          >
            {isLoading ? "접속중..." : "로그인"}
          </button>
        </form>

        {/* 하단 링크 (회원가입) */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            아직 계정이 없으신가요?{" "}
            <Link 
              href="/join" 
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition"
            >
              회원가입 하러가기
            </Link>
          </p>
        </div>

      </div>

      {/* 배경 장식 (선택 사항) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

    </div>
  );
}