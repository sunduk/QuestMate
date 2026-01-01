import { useRef } from "react";

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
      {/* 미리보기 */}
      {previewUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-fade-in-up">
          <img
            src={previewUrl}
            alt="Preview"
            className="mb-3 w-full rounded-lg object-cover h-48 border border-gray-200"
          />
          <input
            type="text"
            placeholder="한줄 소감 (선택)"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-green-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={onSubmit}
              disabled={isVerifying}
              className="flex-1 rounded-lg bg-green-500 py-3 font-bold text-white shadow-md active:scale-95 disabled:bg-gray-400"
            >
              {isVerifying ? "전송 중..." : "제출하기"}
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-600 active:scale-95"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 인증하기 버튼 */}
      {!previewUrl && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
          <button
            className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition active:scale-95 hover:bg-green-600"
            onClick={() => fileInputRef.current?.click()}
          >
            📷 인증하기
          </button>
        </>
      )}
    </div>
  );
};
