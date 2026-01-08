import { useState, useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7173";

export const useProtectedImage = (fileId?: number | null) => {
  const token = useAuthStore((s) => s.token);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setSrc(null);
      setLoading(false);
      setError(null);
      return;
    }

    let canceled = false;
    let objectUrl: string | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/files/verification/${fileId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // 서버가 이미지가 없는 게시물에 대해 Ok()만 반환할 수 있음
        // (예: 204 No Content 또는 Content-Length: 0). 이 경우는 에러가 아니므로
        // 이미지가 없음을 표시하도록 처리합니다.
        if (res.status === 204) {
          if (!canceled) {
            setSrc(null);
            setError(null);
          }
          return;
        }

        const contentLength = res.headers.get("content-length");
        if (contentLength === "0") {
          if (!canceled) {
            setSrc(null);
            setError(null);
          }
          return;
        }

        const blob = await res.blob();
        if (!blob || blob.size === 0) {
          if (!canceled) {
            setSrc(null);
            setError(null);
          }
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        if (!canceled) setSrc(objectUrl);
      } catch (err) {
        console.error(err);
        if (!canceled) setError("이미지 로드 실패");
        if (!canceled) setSrc(null);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    load();

    return () => {
      canceled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, token]);

  return { src, loading, error } as const;
};

export default useProtectedImage;
