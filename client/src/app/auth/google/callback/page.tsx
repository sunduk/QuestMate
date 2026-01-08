"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../../lib/axios";
import { useAuthStore } from "../../../../store/useAuthStore";
import { handleLoginSuccess } from "../../../../lib/authHelpers";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // 1. URL에서 인가코드 추출
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const state = searchParams.get("state") || "/";

      if (errorParam) {
        setError("구글 로그인이 취소되었습니다.");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      if (!code) {
        setError("인가코드를 받지 못했습니다.");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      try {
        // 2. 인가코드를 서버로 전송
        const response = await api.get(`/GoogleCallback?code=${code}`);

        // 3. 서버에서 받은 토큰과 사용자 정보 저장 (재사용 가능한 헬퍼로 처리)
        console.log("응답 데이터:", response.data);
        await handleLoginSuccess(response.data, setAuth, router, state || undefined);
      } catch (err: unknown) {
        console.error("구글 로그인 처리 실패:", err);
        const errorMessage = err && typeof err === 'object' && 'response' in err
          ? (err.response as { data?: { message?: string } })?.data?.message
          : undefined;
        setError(errorMessage || "로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fbf3e0]">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h2 className="text-xl font-bold text-gray-800">{error}</h2>
            <p className="mt-2 text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <img src="/form_img.png" alt="Loading" className="mx-auto mb-4 w-30 animate-spin-slow" />
            <h2 className="text-xl font-bold text-gray-800">구글 로그인 처리 중...</h2>
            <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요</p>
          </>
        )}
      </div>
    </div>
  );
}
