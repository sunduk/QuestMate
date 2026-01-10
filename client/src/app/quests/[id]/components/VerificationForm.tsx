import { useRef, useState, useEffect, memo } from "react";

interface VerificationFormProps {
  isJoined: boolean;
  isCompleted: boolean;
  isJoining: boolean;
  isVerifying: boolean;
  previewUrl: string | null;
  comment: string;
  commentInvalid?: boolean;
  entryFee: number;
  onJoin: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const VerificationFormComponent = ({
  isJoined,
  isCompleted,
  isJoining,
  isVerifying,
  previewUrl,
  comment,
  commentInvalid,
  entryFee,
  onJoin,
  onFileChange,
  onCommentChange,
  onSubmit,
  onCancel,
}: VerificationFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  // Allow opening the form when previewUrl becomes available.
  // setOpen is stable, and we intentionally only react to previewUrl changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (previewUrl) setOpen(true);
  }, [previewUrl]);

  useEffect(() => {
    if (open) {
      commentInputRef.current?.focus();
    }
  }, [open]);

  if (!isJoined) {
    return (
      <>
        {/* <button
          onClick={onJoin}
          disabled={isJoining}
          className={`w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition active:scale-95 ${
            isJoining
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
          }`}
        >
          {isJoining ? "입장 처리 중..." : "이 파티 참가하기"}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">참가 시 {entryFee} G가 차감됩니다.</p> */}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {/* 초기 버튼: 폼 열기 */}
      {!open && (
        isCompleted ? (
          <div 
            className="w-full h-16 rounded-xl bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/completed_bg.png')" }}
          >
            <span className="text-lg font-bold text-[#482e17]">
              모든 발자국을 남겼습니다!
            </span>
          </div>
        ) : (
          <button
            className="relative w-full h-15 overflow-hidden transition active:scale-95 hover:brightness-105 group rounded-full"
            onClick={() => setOpen(true)}
          >
            <div 
              className="absolute inset-0 h-16 bg-cover bg-center rounded-full"
              style={{ backgroundImage: "url('/button_write_blank.png')" }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-bold text-[#fffdf2] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              오늘의 발자국 남기기
            </span>
          </button>
        )
      )}

      {/* 에디트 폼: 사진 선택 여부와 관계없이 바로 보여줌 */}
      {open && (
        <div className="rounded-xl border-2 border-[#df9e7e] bg-[#fbead3] p-4 animate-fade-in-up">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="mb-3 w-full rounded-lg object-cover h-48 md:h-80 lg:h-96 border border-gray-200"
            />
          ) : (
            <div 
              className="mb-3 w-full rounded-lg h-48 md:h-80 lg:h-96 border border-[#d6c6ac] bg-[#fbf3e8] flex items-center justify-center text-sm text-slate-400 bg-no-repeat bg-center" 
              style={{
                backgroundImage: "url('/form_img.png')",
                backgroundSize: "150px auto"
              }}
            >
            </div>
          )}

          <input
            ref={commentInputRef}
            type="text"
            placeholder="한줄 메시지 남기기..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className={`w-full rounded-lg text-[#553b24] p-2 text-sm outline-none border ${
              commentInvalid ? "border-red-300 ring-1 ring-red-100 animate-blink-border" : "border-[#b29478] focus:border-[#553b24]"
            }`}
          />

          <div className="mt-3 flex gap-2 items-center">
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="active:scale-95 transition-transform"
              >
                <img src="/form_addpic.png" alt="Add picture" className="w-15 h-15 object-contain" />
              </button>
            </div>
            <button
              onClick={onSubmit}
              disabled={isVerifying}
              className="relative h-10 px-6 overflow-hidden shadow-md shadow-amber-900/20 transition active:scale-95 hover:brightness-105 group rounded-xl disabled:opacity-50 disabled:grayscale"
            >
              <div 
                className="absolute inset-0 h-11 bg-cover bg-center"
                style={{ backgroundImage: "url('/form_button.png')" }}
              />
              <span className="relative z-10 flex items-center justify-center text-sm font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                {isVerifying ? "전송 중..." : "발자국 남기기"}
              </span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onCancel();
              }}
              className="relative h-10 px-6 overflow-hidden transition active:scale-95 hover:brightness-105 group rounded-xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/button_cancel.png')" }}
              />
              <span className="relative z-10 flex items-center justify-center text-sm font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                취소
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const VerificationForm = memo(VerificationFormComponent);
