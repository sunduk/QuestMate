import { VerificationViewModel } from "../types";

interface VerificationFeedProps {
  verifications: VerificationViewModel[];
  editingVerifyId: number | null;
  editingComment: string;
  editingPreviewUrl: string | null;
  deletingVerifyId: number | null;
  onStartEdit: (v: VerificationViewModel) => void;
  onCancelEdit: () => void;
  onSubmitEdit: () => void;
  onDelete: (id: number) => void;
  onEditCommentChange: (comment: string) => void;
  onEditImageChange: (file: File) => void;
}

export const VerificationFeed = ({
  verifications,
  editingVerifyId,
  editingComment,
  editingPreviewUrl,
  deletingVerifyId,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onEditCommentChange,
  onEditImageChange,
}: VerificationFeedProps) => {
  if (verifications.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
        아직 올라온 인증샷이 없습니다.
        <br />첫 번째 주인공이 되어보세요! 🚀
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {verifications.map((v) => (
        <div
          key={v.id}
          className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
            editingVerifyId === v.id ? "border-blue-500 ring-4 ring-blue-500/20" : "border-gray-100"
          }`}
        >
          {/* 유저 정보 */}
          <div className="flex items-center gap-2 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg border border-gray-200">
              {v.userAvatar}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">{v.userName}</span>
              <span className="text-[10px] text-slate-400">{v.createdAt}</span>
            </div>
            {/* 수정/삭제 버튼 */}
            {v.isMine && editingVerifyId !== v.id && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => onStartEdit(v)}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 active:scale-95"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(v.id)}
                  disabled={deletingVerifyId === v.id}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                >
                  {deletingVerifyId === v.id ? "삭제중" : "삭제"}
                </button>
              </div>
            )}
          </div>

          {/* 인증 이미지 */}
          <div className="relative aspect-video w-full bg-gray-100">
            <img
              src={editingVerifyId === v.id ? editingPreviewUrl || v.imageUrl : v.imageUrl}
              alt="Verification"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/400x225?text=Image+Not+Found";
              }}
            />
            {/* 이미지 변경 버튼 */}
            {editingVerifyId === v.id && (
              <button
                onClick={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (file) onEditImageChange(file);
                  };
                  fileInput.click();
                }}
                className="absolute bottom-2 right-2 rounded-md bg-gray-800 bg-opacity-70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-opacity-90 active:scale-95"
              >
                변경
              </button>
            )}
          </div>

          {/* 코멘트 */}
          <div className="p-3">
            {editingVerifyId === v.id ? (
              <textarea
                value={editingComment ?? ""}
                onChange={(e) => onEditCommentChange(e.target.value)}
                placeholder="한줄 소감을 남겨주세요."
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
                rows={2}
              />
            ) : (
              v.comment && <p className="text-sm text-slate-600 leading-relaxed">{v.comment}</p>
            )}
          </div>

          {/* 제출/취소 버튼 */}
          {editingVerifyId === v.id && (
            <div className="flex gap-2 border-t border-gray-100 p-3">
              <button
                onClick={onSubmitEdit}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                제출
              </button>
              <button
                onClick={onCancelEdit}
                className="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-300 active:scale-95"
              >
                취소
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
