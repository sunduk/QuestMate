interface QuestDetailPageProps {
  params: {
    id: string;
  };
}

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  // 나중에 서버에서 params.id로 데이터 조회
  const quest = {
    title: "퀘스트 정보",
    description: "퀘스트 상세 설명 및 보상 정보",
    rewardIcon: "🏋️",
    participants: ["🧑‍🦰", "🧟‍♂️", "👨"],
  };

  return (
    <div className="relative flex min-h-full flex-col px-6 py-8">
      <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
        {/* 제목 */}
        <h1 className="mb-4 text-xl font-bold text-gray-800">
          {quest.title}
        </h1>

        {/* 퀘스트 카드 */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          {/* 보상 아이콘 */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-inner">
              <span className="text-5xl">{quest.rewardIcon}</span>
            </div>
          </div>

          {/* 설명 */}
          <p className="mb-6 text-center text-gray-700 font-medium">
            {quest.description}
          </p>

          {/* 참가자 */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-gray-600">
              참가자 프로필 목록
            </p>

            <div className="flex justify-center gap-4">
              {quest.participants.map((p, index) => (
                <div
                  key={index}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow"
                >
                  <span className="text-xl">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 파티 참가 버튼 */}
          <button
            className="
              mt-4 w-full rounded-xl
              bg-gradient-to-b from-yellow-300 to-yellow-500
              py-3 text-lg font-bold text-white
              shadow-md transition
              active:scale-95
            "
          >
            파티 참가
          </button>
        </section>
      </main>
    </div>
  );
}
