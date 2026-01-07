"use client";

import UserAvatar from "@/src/components/UserAvatar";
import AvatarSelectModal from "@/src/components/AvatarSelectModal";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { inquiryDetail, inquiryEmail, developerDetail, privacyDetail } from "./details";
import { useAuthStore } from "@/src/store/useAuthStore";
import api from "@/src/lib/axios";
import Image from 'next/image';

// ----------------------------------------------------------------------
// [데이터 모델] 서버 DTO 정의
// ----------------------------------------------------------------------
interface UserDto {
  id: number;
  avatarNumber?: number | null;
  nickname?: string | null;
}

function AutoFitText({
  children,
  className,
  max = 16,
  min = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  min?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let fs = max;
      el.style.fontSize = fs + "px";
      // reduce until fits or reaches min
      while (el.scrollWidth > el.clientWidth && fs > min) {
        fs -= 1;
        el.style.fontSize = fs + "px";
      }
      setFontSize(fs);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [children, max, min]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize }}
    >
      {children}
    </div>
  );
}

export default function SettingPage() {
  const user = useAuthStore((state) => state.user);

  // nickname edit UI state
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState<string>(user?.nickname ?? "");
  const editRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimeoutRef = useRef<number | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const avatarWrapperRef = useRef<HTMLDivElement | null>(null);

  // keep input synced with store when not editing
  useEffect(() => {
    if (!isEditingNickname) {
      const newVal = user?.nickname ?? "";
      if (newVal !== nicknameInput) {
        const t = setTimeout(() => setNicknameInput(newVal), 0);
        return () => clearTimeout(t);
      }
    }
  }, [user?.nickname, isEditingNickname, nicknameInput]);

  // cancel edit on outside click
  useEffect(() => {
    if (!isEditingNickname) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setIsEditingNickname(false);
        setNicknameInput(user?.nickname ?? "");
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isEditingNickname, user?.nickname]);

  // focus and select input when entering edit mode
  useEffect(() => {
    if (!isEditingNickname) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
      try { inputRef.current?.select(); } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(t);
  }, [isEditingNickname]);

  // avatar modal outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarWrapperRef.current && !avatarWrapperRef.current.contains(event.target as Node)) {
        setIsAvatarModalOpen(false);
      }
    };

    if (isAvatarModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarModalOpen]);

  const fetchUserInfo = async () => {
    try {
      // 1. API 요청 (GET /auth/me)
      const response = await api.get('/auth/me');
      const dto = response.data as UserDto;

      if (dto) {
        console.log("유저 정보 로드:", dto);
        // 2. 데이터 파싱 (Server DTO -> Client Store)
        const currentUser = useAuthStore.getState().user;

        if (currentUser) {
          // user 객체를 한 번에 업데이트 (UI 갱신 보장)
          const updatedUser = { ...currentUser };
          
          if (typeof dto.avatarNumber === 'number') {
            updatedUser.avatarNumber = dto.avatarNumber;
          }
          
          if (dto.nickname) {
            updatedUser.nickname = dto.nickname;
          }

          useAuthStore.setState({ user: updatedUser });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // send nickname update to server and refresh local user data
  const handleChangeNickname = async (newNickname: string) => {
    try {
      // POST to update nickname
      await api.post('/userinfo/updatenickname', { Nickname: newNickname });

      // refresh current user info from server to keep store in sync
      await fetchUserInfo();

      // notify other windows/components
      window.dispatchEvent(new Event('user:update'));
      // show temporary success message on the button
      setSuccessMessage("이름이 정상적으로 변경되었습니다.");
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = window.setTimeout(() => {
        setSuccessMessage(null);
        successTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to update nickname:', error);
    }
  };

  

  // [Effect] 페이지 로드 시 API 호출
  // Also refresh when other parts of the app emit a `user:update` event,
  // when localStorage changes (other tabs), or when window gains focus.
  useEffect(() => {
    fetchUserInfo();

    const onUserUpdate = () => fetchUserInfo();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth-storage' || e.key === 'accessToken') fetchUserInfo();
    };

    window.addEventListener('user:update', onUserUpdate);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('user:update', onUserUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // cleanup success timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center px-2 py-2 pb-20"
      style={{ backgroundImage: "url('/home_bg.png')" }}>

      {/* 스크롤 영역 */}
      <div className="absolute inset-0 px-6 py-8 pb-24">

        {/* 페이지 타이틀 */}
        <h1 className="mb-6 text-2xl font-bold text-[#5b3a1b] text-center">
          설정
        </h1>

        {/* ===== 상단 50% : 유저 정보 ===== */}
        <section className="mb-8">
          {user ? (
            <div 
              className="bg-[#a06624]/10 backdrop-blur-sm shadow-md flex items-center gap-4 rounded-2xl pt-3 pb-3 pl-3"
              >

              <div className="flex items-center gap-4">
                {/* 프로필 아이콘 */}
                <div className="relative" ref={avatarWrapperRef}>
                  <button onClick={() => setIsAvatarModalOpen(!isAvatarModalOpen)}>
                    <UserAvatar avatarNumber={user.avatarNumber} size={80} className="cursor-pointer hover:brightness-110" />
                  </button>
                  
                  <AvatarSelectModal 
                    isOpen={isAvatarModalOpen}
                    onClose={() => setIsAvatarModalOpen(false)}
                    currentAvatarNumber={user.avatarNumber??0}
                    anchorRef={avatarWrapperRef}
                  />
                </div>
              </div>

              {/* 닉네임 영역 */}
              <div className="mt-1 flex flex-col gap-2">
                <div className="text-sm text-[#5b3a1b] pl-3">{successMessage ?? '노트에 쓸 내 이름'}</div>
                <div className="flex-1 rounded-full bg-[#fff6e8] h-10 pl-6 pr-1 py-0 align-middle flex items-center shadow-md">
                  <div className="flex items-center justify-between mt-0 h-10">

                      <div ref={editRef} className="flex items-center gap-2">
                        {isEditingNickname ? (
                          <input
                            ref={inputRef}
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                try {
                                  await handleChangeNickname(nicknameInput);
                                } catch {
                                  // ignore
                                }
                                setIsEditingNickname(false);
                              } else if (e.key === 'Escape') {
                                setIsEditingNickname(false);
                                setNicknameInput(user?.nickname ?? "");
                              }
                            }}
                            autoFocus
                            className="font-semibold text-[#583312] text-sl text-shadow-md w-32 bg-transparent outline-none"
                          />
                        ) : (
                          <AutoFitText className="font-semibold text-[#583312] text-sl text-shadow-md w-32" max={16} min={10}>
                            {user.nickname}
                          </AutoFitText>
                        )}

                        {
                          !isEditingNickname && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNicknameInput(user?.nickname ?? "");
                              setIsEditingNickname(true);
                            }}
                            className="w-23 h-8 text-white text-sm font-semibold text-shadow-md text-shadow-[#58534f] transition active:scale-95 "
                            style={{
                              backgroundImage: "url('/setting_button_green.png')",
                              backgroundSize: '100% 100%',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                            }}
                          >
                            {isEditingNickname ? "변경 완료" : "이름 변경"}
                          </button>
                        )}

                        {
                          isEditingNickname && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingNickname(false);
                              setNicknameInput(user?.nickname ?? "");
                              handleChangeNickname(nicknameInput);
                            }}
                            disabled={nicknameInput.trim().length <= 0}
                            hidden={nicknameInput.trim().length <= 0}
                            className="w-23 h-8 text-white text-sm font-semibold text-shadow-md text-shadow-[#58534f] transition active:scale-95 "
                            style={{
                              backgroundImage: (nicknameInput.length <= 0 ? "url('/setting_button_gray.png')" : "url('/setting_button_orange.png')"),
                              backgroundSize: '100% 100%',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                            }}
                          >
                            변경 완료
                          </button>
                        )}

                      </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#f7ecd9]/30 backdrop-blur-sm shadow-md rounded-2xl p-6 text-center">
              <p className="text-[#5b3a1b] text-lg font-medium mb-2">로그인이 필요합니다</p>
              <p className="text-[#8b6a4a] text-sm">프로필 설정을 보려면 먼저 로그인해주세요.</p>
            </div>
          )}
        </section>

        {/* ===== 하단 50% : 설정 메뉴 ===== */}
        <section>
          <div className="rounded-2xl bg-[#f7ecd9]/20 backdrop-blur-sm shadow-md p-4 space-y-3">

            {/* 메뉴 아이템 */}
            <SettingItem
              icon="/setting_icon_cs.png"
              label="문의사항"
              detail={inquiryDetail}
              email={inquiryEmail}
            />
            <SettingItem
              icon="/setting_icon_info.png"
              label="개발자 소개"
              detail={developerDetail}
            />
            <SettingItem
              icon="/setting_icon_privacy.png"
              label="개인정보 처리방침"
              detail={privacyDetail}
            />
            <SettingItem
              icon="/setting_icon_logout.png"
              label="로그아웃"
            />
          </div>
        </section>

      </div>
    </div>
  );
}

/* ===== 설정 메뉴 공통 컴포넌트 ===== */
function SettingItem({
  icon,
  label,
  detail,
  email,
}: {
  icon: string;
  label: string;
  detail?: string;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <button
        onClick={() => detail && setOpen((s) => !s)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 rounded-xl bg-[#fff6e8] px-4 py-3 text-left hover:bg-[#f2e2c9] transition"
      >
        <Image src={icon} alt="" width={24} height={24} className="w-6 h-6 opacity-80 mr-3" />
        <span className="flex-1 text-[#5b3a1b] font-medium">
          {label}
        </span>
        <span className="text-[#a0825e] font-bold text-xl">{detail ? (open ? "-" : "+") : ""}</span>
      </button>
      {detail && (
        <div
          className={`mt-2 pl-3 pr-4 text-[#5b3a1b] text-sm transition-all overflow-auto ${open ? "max-h-100" : "max-h-0"}`}
        >
          <div className="py-2 pl-3 bg-[#fffdf7] rounded-lg shadow-inner" style={{ whiteSpace: 'pre-line' }}>{detail}</div>
          {
            email && (
              <div className="py-2 pl-3 bg-[#fffdf7] rounded-lg shadow-inner" style={{ whiteSpace: 'pre-line' }}>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Image src="/icon_email.png" alt="Email Icon" width={36} height={36} className="w-9" />
                    <a href={`mailto:${email}`} className="text-[#5b3a1b] underline break-words text-base">{email}</a>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!email) return;
                        try {
                          await navigator.clipboard.writeText(email);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          // ignore
                        }
                      }}
                      aria-label="Copy email"
                      className="rounded hover:bg-[#f0ead8]"
                    >
                    {!copied &&
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#5b3a1b]">
                            <path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1zM20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h12v14z" />
                        </svg>
                    }
                    </button>
                    {copied && <span className="pr-2 text-sm text-slate-600 self-center leading-none">복사됨</span>}
                  </div>
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
