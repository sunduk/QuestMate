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
        const blob = await res.blob();
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
