"use client";

import React from "react";
import { createRoot } from "react-dom/client";

type ResolveFn = (value: boolean) => void;

const Modal: React.FC<{ message: string; resolve: ResolveFn }> = ({ message, resolve }) => {
  return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" 
            style={{ backgroundImage: "url('/popup_bg02.png')", backgroundSize: "cover" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex flex-col items-center gap-4">
              <img src="/stamp.png" alt="Exit" className="w-35 h-35 object-contain" />
              <h3 className="text-2xl font-bold text-[#4d2e14]">{message}</h3>

              <div className="mt-4 flex gap-3 w-full">
                <button onClick={() => resolve(true)}
                className="flex-1 h-10 rounded-full border border-gray-300 bg-[#d07e46] text-base text-[#ffffff] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                  // style={{ backgroundImage: "url('/form_button_noimage.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                >
                  확인
                </button>
                
                <button onClick={() => resolve(false)}
                  className="flex-1 h-10 rounded-full border border-gray-300 bg-[#f7f4eb] text-base text-[#47301f] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>





    // <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backgroundImage: "url('/popup_bg02.png')", backgroundSize: "cover" }}>
    //   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
    //   <div style={{ position: 'relative', background: '#fff', padding: 20, borderRadius: 12, minWidth: 280, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
    //     <div style={{ marginBottom: 12 }}>{message}</div>
    //     <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
    //       <button onClick={() => resolve(false)} style={{ padding: '6px 12px' }}>취소</button>
    //       <button onClick={() => resolve(true)} style={{ padding: '6px 12px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6 }}>확인</button>
    //     </div>
    //   </div>
    // </div>
  );
};

export default function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = (value: boolean) => {
      try {
        root.unmount();
      } catch {}
      if (container.parentNode) container.parentNode.removeChild(container);
      resolve(value);
    };

    root.render(<Modal message={message} resolve={cleanup} />);
  });
}
