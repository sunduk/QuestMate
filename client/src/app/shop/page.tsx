"use client";

import { useState } from "react";

type Category = "가구" | "벽지" | "바닥" | "소품";

interface ShopItem {
  id: number;
  name: string;
  price: number;
  icon: string;
}

const categories: Category[] = ["가구", "벽지", "바닥", "소품"];

const mockItems: ShopItem[] = [
  { id: 1, name: "작은 책상", price: 500, icon: "🪑" },
  { id: 2, name: "테이블", price: 500, icon: "🪟" },
  { id: 3, name: "화분", price: 1200, icon: "🌱" },
  { id: 4, name: "서랍장", price: 1220, icon: "🗄️" },
  { id: 5, name: "의자", price: 500, icon: "💺" },
  { id: 6, name: "선반", price: 1220, icon: "📚" },
];

export default function ShopPage() {
  const [category, setCategory] = useState<Category>("가구");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  return (
    <div className="relative flex min-h-full flex-col px-6 py-8">

      <main className="flex-1 overflow-y-auto bg-gray-50 px-5 py-6">
        {/* 타이틀 */}
        <h1 className="mb-4 text-xl font-bold text-gray-800">/SHOP</h1>

        {/* 카테고리 탭 */}
        <div className="mb-6 flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition
                ${
                  category === c
                    ? "bg-gradient-to-b from-yellow-300 to-yellow-500 text-white shadow"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 아이템 그리드 */}
        <div className="grid grid-cols-3 gap-4">
          {mockItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="rounded-xl bg-white p-3 shadow-sm transition active:scale-95"
            >
              <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-gray-100 text-3xl">
                {item.icon}
              </div>
              <p className="text-xs font-medium text-gray-700 text-center">
                {item.price} G
              </p>
            </button>
          ))}
        </div>
      </main>


      {/* 구매 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-72 rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-green-100 text-5xl">
                {selectedItem.icon}
              </div>
            </div>

            <h2 className="mb-1 text-center font-bold text-gray-800">
              {selectedItem.name}
            </h2>
            <p className="mb-4 text-center text-sm text-gray-500">
              획득 비용: {selectedItem.price} G
            </p>

            <button
              className="mb-2 w-full rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 py-3 font-bold text-white shadow active:scale-95"
            >
              구매하기
            </button>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2 text-sm text-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
