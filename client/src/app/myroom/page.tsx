"use client";

import { useRouter } from "next/navigation";

export default function MyRoomPage() {
    const router = useRouter();

  return (
    <div className="flex min-h-full flex-col items-center px-6 py-8">

      <main className="flex-1 overflow-y-auto bg-gray-50 px-5 py-6">
        {/* 타이틀 */}
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-gray-800">
          MY ROOM
        </h1>

        {/* 👉 Edit 버튼 */}
        <button
          onClick={() => router.push("/myroomedit")}
          className="rounded-md bg-yellow-400 px-3 py-1 text-sm font-semibold text-slate-900"
        >
          Edit
        </button>

        {/* 방 미리보기 */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-md">
          <div className="relative overflow-hidden rounded-xl bg-slate-200">
            {/* 방 이미지 (임시) */}
            <div className="flex aspect-square items-center justify-center text-6xl">
              🛋️
            </div>

            {/* 스크린샷 버튼 */}
            <button
              className="
                absolute bottom-2 right-2
                flex items-center gap-1
                rounded-lg bg-white/90 px-2 py-1
                text-xs font-medium text-gray-700
                shadow
              "
            >
              📷 스크린샷
            </button>
          </div>
        </section>

        {/* 방명록 카드 */}
        <section className="rounded-2xl bg-slate-800 p-4 text-slate-100 shadow-md">
          <h2 className="mb-2 text-sm font-bold">방명록</h2>

          <div className="flex items-start gap-3">
            {/* 아이콘 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-xl">
              📖
            </div>

            {/* 내용 */}
            <div className="flex-1">
              <p className="text-sm font-semibold">멋진 방!</p>
              <p className="text-xs text-slate-300">
                모진 발 멋진 방!
              </p>
            </div>

            {/* 반응 아이콘 */}
            <div className="flex gap-2">
              <span className="text-yellow-400">🟡</span>
              <span className="text-red-400">🔴</span>
              <span className="text-blue-400">🔵</span>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
