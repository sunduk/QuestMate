import { useRef, useState, useEffect } from "react";

interface VerificationFormProps {
  isJoined: boolean;
  isJoining: boolean;
  isVerifying: boolean;
  previewUrl: string | null;
  comment: string;
  entryFee: number;
  onJoin: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const VerificationForm = ({
  isJoined,
  isJoining,
  isVerifying,
  previewUrl,
  comment,
  entryFee,
  onJoin,
  onFileChange,
  onCommentChange,
  onSubmit,
  onCancel,
}: VerificationFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  // Allow opening the form when previewUrl becomes available.
  // setOpen is stable, and we intentionally only react to previewUrl changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (previewUrl) setOpen(true);
  }, [previewUrl]);

  if (!isJoined) {
    return (
      <>
        <button
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
        <p className="mt-3 text-center text-xs text-slate-400">참가 시 {entryFee} G가 차감됩니다.</p>
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
        <button
          className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition active:scale-95 hover:bg-green-600"
          onClick={() => setOpen(true)}
        >
          📷 인증하기
        </button>
      )}

      {/* 에디트 폼: 사진 선택 여부와 관계없이 바로 보여줌 */}
      {open && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-fade-in-up">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="mb-3 w-full rounded-lg object-cover h-48 border border-gray-200"
            />
          ) : (
            <div className="mb-3 w-full rounded-lg h-48 border border-gray-200 bg-white flex items-center justify-center text-sm text-slate-400">이미지 없음</div>
          )}

          <input
            type="text"
            placeholder="한줄 소감 (선택)"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-green-500"
          />

          <div className="mt-3 flex gap-2 items-center">
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-gray-200 px-4 py-2 font-bold text-gray-700 active:scale-95"
              >
                사진 선택
              </button>
            </div>
            <button
              onClick={onSubmit}
              disabled={isVerifying}
              className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white shadow-md active:scale-95 disabled:bg-gray-400"
            >
              {isVerifying ? "전송 중..." : "제출하기"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onCancel();
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 font-bold text-gray-700 active:scale-95"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
