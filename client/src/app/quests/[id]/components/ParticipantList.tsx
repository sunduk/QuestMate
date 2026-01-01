import { ParticipantViewModel } from "../types";

interface ParticipantListProps {
  participants: ParticipantViewModel[];
  targetCount: number;
}

export const ParticipantList = ({ participants, targetCount }: ParticipantListProps) => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          참여자 현황{" "}
          <span className="text-slate-400 text-sm font-normal">({participants.length}/4)</span>
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {participants.map((p, index) => {
          const progress = Math.min(100, Math.max(0, (p.current / targetCount) * 100));
          const isCompleted = p.current >= targetCount;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm border-2 ${
                    p.isMe ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {p.avatar}
                </div>
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ring-2 ring-white">
                    V
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className={`text-sm font-bold ${p.isMe ? "text-slate-900" : "text-slate-600"}`}>
                    {p.name}{" "}
                    {p.isMe && <span className="text-xs text-yellow-500 font-normal">(나)</span>}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {p.current} / {targetCount}회
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isCompleted ? "bg-blue-500" : "bg-yellow-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
