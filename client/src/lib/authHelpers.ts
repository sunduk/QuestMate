type LoginResponse = {
  accessToken?: string;
  userId?: number;
  avatarNumber?: number | string;
  nickname?: string;
  [key: string]: unknown;
};

type AuthSetter = (user: { id: number; email: string; nickname: string; avatarNumber?: number | undefined }, token: string) => void;

type RouterLike = { push: (url: string) => void };

export async function handleLoginSuccess(
  data: LoginResponse,
  setAuth: AuthSetter,
  router: RouterLike,
  state?: string
) {
  const { accessToken, userId, avatarNumber, nickname } = data;

  if (accessToken && userId !== undefined && userId !== null) {
    // ensure types
    const parsedAvatar = typeof avatarNumber === 'string' ? parseInt(avatarNumber, 10) : avatarNumber;
    setAuth({ id: userId as number, email: "", nickname: nickname ?? "", avatarNumber: parsedAvatar as number | undefined }, accessToken as string);

    // persist same keys as other flows
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("isLoggedIn", "true");
      if (parsedAvatar !== undefined && parsedAvatar !== null) localStorage.setItem("avatarNumber", parsedAvatar.toString());
      if (nickname !== undefined && nickname !== null) localStorage.setItem("nickname", nickname);
    } catch (e) {
      // ignore localStorage errors
      console.warn("localStorage unavailable", e);
    }

    // navigate
    router.push(state || "/");
  } else {
    throw new Error("로그인 정보를 받지 못했습니다.");
  }
}
