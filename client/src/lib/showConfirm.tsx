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
            <img src="/icon_delete02.png" alt="Exit" className="w-35 h-35 object-contain" />
            <h3 className="text-2xl font-bold text-[#4d2e14]">{message}</h3>

            <div className="mt-4 flex gap-5 w-full">
              <button onClick={() => resolve(true)}
              className="flex-1 h-10 rounded-full text-base text-[#ffffff] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                style={{ backgroundImage: "url('/button_bg_red.png')" }}
              >
                확인
              </button>
              
              <button onClick={() => resolve(false)}
                className="flex-1 h-10 rounded-full text-base text-[#ffffff] font-medium overflow-hidden bg-cover bg-center bg-no-repeat bg-clip-padding transition active:scale-95"
                style={{ backgroundImage: "url('/button_bg_gray.png')" }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
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
