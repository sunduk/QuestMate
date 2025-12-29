"use client";

import { useState } from "react";

const tabs = ["가구", "벽지", "바닥", "소품"];

export default function MyRoomPage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("가구");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-900 pb-20 text-slate-100">
      {/* 상단 바 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span>💰</span>
          <span className="font-semibold">999,999 G</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-lg">🔔</button>
          <button className="text-lg">⚙️</button>
        </div>
      </header>

      {/* 타이틀 + Edit 버튼 */}
      <section className="flex items-center justify-between px-4">
        <h1 className="text-2xl font-bold">MY ROOM</h1>

        <button
          onClick={() => setEditMode(!editMode)}
          className={`rounded-md px-3 py-1 text-sm font-semibold ${
            editMode
              ? "bg-yellow-400 text-slate-900"
              : "bg-slate-700 text-slate-200"
          }`}
        >
          {editMode ? "Save" : "Edit Mode"}
        </button>
      </section>

      {/* 탭 */}
      <div className="mt-3 flex gap-2 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              activeTab === tab
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 방 영역 */}
      <section className="px-4 py-4">
        <div className="relative aspect-square w-full rounded-lg bg-slate-200 p-3">
          {/* 방 예시 (이미지 대신 div) */}
          <div className="relative h-full w-full rounded-md bg-[#cde7e3]">
            {/* 가구 예시 */}
            <div className="absolute left-6 top-8 h-16 w-20 rounded bg-amber-700" />
            <div className="absolute bottom-8 left-16 h-14 w-14 rounded bg-amber-600" />
            <div className="absolute bottom-8 right-6 h-20 w-16 rounded bg-green-500" />

            {/* 편집 중 표시 */}
            {editMode && (
              <div className="absolute bottom-8 left-16 h-14 w-14 rounded border-2 border-dashed border-white" />
            )}
          </div>
        </div>
      </section>

      {/* 인벤토리 */}
      <section className="mt-auto bg-slate-800 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>방콕 Inventory</span>
          <div className="flex gap-2">
            <span>🟠</span>
            <span>🔴</span>
            <span>🔵</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              className="aspect-square rounded-lg bg-slate-700"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
