"use client";

import UserAvatar from "@/src/components/UserAvatar";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { inquiryDetail, inquiryEmail, developerDetail, privacyDetail } from "./details";
import { useAuthStore } from "@/src/store/useAuthStore";

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

export default function SettingPage() {  const user = useAuthStore((state) => state.user);
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
                <UserAvatar avatarNumber={user.avatarNumber || 15} size={80} className="cursor-pointer hover:brightness-110" />
              </div>

              {/* 닉네임 영역 */}
              <div className="mt-1 flex items-center gap-3">
                <div className="flex-1 rounded-full bg-[#fff6e8] pl-6 pr-1 py-2">
                  <div className="flex items-center justify-between mt-0 h-8">

                      <AutoFitText className="font-semibold text-[#583312] text-sl text-shadow-md w-32" max={16} min={10}>
                        {user.nickname}
                      </AutoFitText>

                      <button
                          className="w-23 h-8 text-white text-sm font-semibold text-shadow-md text-shadow-[#58534f] transition active:scale-95 "
                          style={{ 
                              backgroundImage: "url('/setting_button_green.png')", 
                              backgroundSize: '100% 100%', 
                              backgroundPosition: 'center', 
                              backgroundRepeat: 'no-repeat'
                          }}
                          >
                          닉네임 변경
                      </button>
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
        <img src={icon} alt="" className="w-6 h-6 opacity-80 mr-3" />
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
                    <img src="/icon_email.png" alt="Email Icon" className="w-9" />
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
                        } catch (err) {
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
