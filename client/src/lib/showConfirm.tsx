"use client";

import React from "react";
import { createRoot } from "react-dom/client";

type ResolveFn = (value: boolean) => void;

const Modal: React.FC<{ message: string; resolve: ResolveFn }> = ({ message, resolve }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', background: '#fff', padding: 20, borderRadius: 12, minWidth: 280, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ marginBottom: 12 }}>{message}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => resolve(false)} style={{ padding: '6px 12px' }}>취소</button>
          <button onClick={() => resolve(true)} style={{ padding: '6px 12px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6 }}>확인</button>
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
