import { ParticipantViewModel } from "../types";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getAvatarPath } from "@/src/lib/avatarIcons";

interface ParticipantListProps {
  participants: ParticipantViewModel[];
  targetCount: number;
  durationDays: number;
}

export const ParticipantList = ({ participants, targetCount, durationDays }: ParticipantListProps) => {
  const { user } = useAuthStore();
  const myAvatarNumber = user?.avatarNumber ?? 0;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#482e17]">
          나의 따뜻한 발자국
          {/* <span className="text-slate-400 text-sm font-normal">({participants.length}/4)</span> */}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {participants.map((p, index) => {
          const progress = Math.min(100, Math.max(0, (p.current / durationDays) * 100));
          const isCompleted = p.current >= durationDays;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`flex h-15 w-15 items-center justify-center text-2xl ${
                    isCompleted 
                      ? "bg-contain bg-center bg-no-repeat border-none" 
                      : "rounded-full border-2 " + (p.isMe ? "bg-yellow-50 border-[#929675]" : "bg-gray-50 border-gray-100")
                  }`}
                  style={isCompleted ? { backgroundImage: "url('/quest_icon_gold_border_finish.png')" } : {}}
                >
                  <img 
                    src={p.isMe ? getAvatarPath(myAvatarNumber) : p.avatar} 
                    alt={`${p.name} avatar`} 
                    className="rounded-full w-10 h-10" 
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className={`text-sm font-bold text-[#482e17]`}>
                    {p.name}{" "}
                    {p.isMe && <span className="text-xs text-yellow-500 font-normal">(나)</span>}
                  </span>
                  <span className="text-xs font-medium text-[#796c59]">
                    {p.current} / {durationDays}일
                  </span>
                </div>
                <div 
                  className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-gray-300"
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out bg-cover bg-center"
                    style={{ 
                      width: `${progress}%`,
                      backgroundImage: "url('/progress.png')"
                    }}
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
