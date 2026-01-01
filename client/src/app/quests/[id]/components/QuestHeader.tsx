interface QuestHeaderProps {
  icon: string;
  title: string;
  description: string;
  isJoined: boolean;
  isLeaving: boolean;
  onLeave: () => void;
}

export const QuestHeader = ({
  icon,
  title,
  description,
  isJoined,
  isLeaving,
  onLeave,
}: QuestHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md text-5xl border-2 border-gray-100">
        {icon}
      </div>
      <h1 className="text-2xl font-black text-slate-800 text-center">{title}</h1>
      <p className="mt-2 text-sm text-gray-500 text-center px-4 break-keep">{description}</p>

      {isJoined && (
        <button
          onClick={onLeave}
          disabled={isLeaving}
          className="absolute top-4 right-4 z-10 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-md transition active:scale-95 hover:bg-red-700 disabled:bg-gray-400"
        >
          {isLeaving ? "처리중..." : "퀘스트 탈퇴"}
        </button>
      )}
    </div>
  );
};
