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
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl text-5xl">
        <img src={icon} alt={title} className="h-20 w-20 object-contain" />
      </div>
      <h1 className="text-2xl font-black text-[#5a3616] text-center">{title}</h1>
      <p className="mt-2 text-sm text-[#796c59] text-center px-4 break-keep">{description}</p>

      {isJoined && (
        <button
          onClick={onLeave}
          disabled={isLeaving}
          className="absolute top-4 right-4 z-10 w-20 h-12 flex items-center justify-center transition active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:grayscale"
          style={{ backgroundImage: "url('/button_delete_feed.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
        >
          <span className="text-[13px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
            {isLeaving ? "..." : "삭제"}
          </span>
        </button>
      )}
    </div>
  );
};
