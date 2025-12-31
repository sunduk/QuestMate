// src/lib/axios.ts
import axios from 'axios';

// 1. Axios 인스턴스 생성 (싱글톤처럼 동작)
// 게임 서버의 Base IP/Port를 미리 박아두는 곳입니다.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7173/api', // HTTP 포트 확인!
  timeout: 5000, // 5초 타임아웃 (네트워크 지연 대비)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. [요청 인터셉터] Request Interceptor
// "패킷 보내기 직전"에 가로채서 공통 헤더를 붙입니다.
api.interceptors.request.use(
  (config) => {
    // 브라우저 저장소에서 토큰 꺼내기
    // (서버 사이드 렌더링 시에는 실행되지 않도록 방어 코드 필요하지만, 일단 Client 위주로)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // 헤더에 토큰 자동 주입 (매번 넣을 필요 없어짐)
          config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. [응답 인터셉터] Response Interceptor
// "패킷 받고 나서" 공통 에러(401 등)를 처리합니다.
api.interceptors.response.use(
  (response) => {
    // 성공 시 데이터만 바로 반환하거나, response 그대로 반환
    return response;
  },
  (error) => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      console.warn("세션이 만료되었습니다. 로그아웃 처리합니다.");
      
      if (typeof window !== 'undefined') {
        // 토큰 삭제 및 로그인 페이지로 강제 이동
        localStorage.removeItem('accessToken');
        // window.location.href = '/login'; // 너무 팍 튀면 UX 안좋으니 선택사항
      }
    }
    return Promise.reject(error);
  }
);

export default api;