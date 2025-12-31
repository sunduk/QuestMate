"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "../../lib/axios"; // 우리가 만든 매니저
import axios from "axios"; // axios 임포트

export default function JoinPage() {
  const router = useRouter();

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 회원가입 핸들러
  const handleJoin = async () => {
    // 1. 클라이언트 유효성 검사
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. 실제 API 호출 (패킷 전송)
      // 게임서버 SendPacket과 동일합니다.
      const response = await api.post("/auth/signup", {
        email: email,
        password: password,
      });

      const { accessToken, userId } = response.data; 

      // 3. 성공 처리 (200 OK)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", userId);

      console.log("회원가입 성공:", response.data);
      
      // 로딩 끄고 성공 모달 띄우기
      setIsLoading(false);
      setShowSuccessModal(true);

    } catch (error) {
      // 2. catch (error) 에는 타입을 명시하지 않습니다. (자동으로 unknown 처리됨)
      
      // Axios 에러인지 타입 체크 (C++의 dynamic_cast와 유사)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMessage = error.response?.data;

        console.error("회원가입 실패(Axios):", error);

        if (status === 409 || status === 400) {
           // 서버에서 보낸 메시지가 객체일 수도, 문자열일 수도 있으니 안전하게 처리
           const msg = typeof serverMessage === 'string' 
             ? serverMessage 
             : "이미 존재하는 계정이거나 입력값이 잘못되었습니다.";
             
           alert(`가입 실패: ${msg}`);
        } else {
           alert(`서버 오류가 발생했습니다. (${status})`);
        }
      } else {
        // Axios 에러가 아닌 일반 스크립트 에러 (문법 오류 등)
        console.error("일반 에러:", error);
        alert("알 수 없는 오류가 발생했습니다.");
      }
      
      setIsLoading(false);
    }
  };

  // 모달 확인 버튼 (로그인으로 이동)
  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    router.push("/home"); // 로그인 페이지로 이동
  };

  return (
    <div className="relative flex min-h-full flex-col px-6 py-8">
      
      <main className="flex-1 overflow-y-auto bg-gray-50 px-1 py-2">
        
        {/* 타이틀 영역 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm text-4xl">
            🏰
          </div>
          <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
          <p className="mt-2 text-sm text-gray-500">
            나만의 방을 꾸미기 위한 첫 걸음!
          </p>
        </div>

        {/* 입력 폼 영역 */}
        <div className="space-y-5">
          {/* 이메일 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              이메일
            </label>
            <input
              type="email"
              placeholder="example@questmate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="6자리 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="한 번 더 입력해주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 
                ${password && passwordConfirm && password !== passwordConfirm 
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                  : "border-gray-200 focus:border-yellow-400 focus:ring-yellow-200"
                }`}
            />
             {password && passwordConfirm && password !== passwordConfirm && (
              <p className="mt-1 ml-1 text-xs text-red-500">비밀번호가 일치하지 않아요.</p>
            )}
          </div>
        </div>

        {/* 가입 버튼 */}
        <div className="mt-10">
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className={`w-full rounded-xl py-4 font-bold text-white shadow transition active:scale-95
              ${isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600"
              }
            `}
          >
            {isLoading ? "처리중..." : "가입 완료"}
          </button>
        </div>
      </main>

      {/* 가입 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-4xl">
                🎉
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-bold text-gray-800">
              환영합니다!
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500 break-keep">
              회원가입이 완료되었습니다.<br/>
              이제 퀘스트를 수행하고 방을 꾸며보세요.
            </p>

            <button
              onClick={handleConfirmSuccess}
              className="w-full rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 py-3 font-bold text-white shadow active:scale-95 transition"
            >
              퀘스트 수행하러 가기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}