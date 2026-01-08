import { useState, useEffect } from "react";
import { VerificationViewModel } from "../types";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getAvatarPath } from "@/src/lib/avatarIcons";
import { useProtectedImage } from "@/src/lib/useProtectedImage";

interface VerificationFeedProps {
  verifications: VerificationViewModel[];
  editingVerifyId: number | null;
  editingComment: string;
  editingPreviewUrl: string | null;
  editingRemovedImage: boolean;
  deletingVerifyId: number | null;
  editingCommentInvalid?: boolean;
  onStartEdit: (v: VerificationViewModel) => void;
  onCancelEdit: () => void;
  onSubmitEdit: () => void;
  onDelete: (id: number) => void;
  onEditCommentChange: (comment: string) => void;
  onEditImageChange: (file: File) => void;
  onRemoveEditImage?: () => void;
}

type VerificationItemProps = {
  v: VerificationViewModel;
  editingVerifyId: number | null;
  editingPreviewUrl: string | null;
  editingComment: string;
  editingRemovedImage: boolean;
  deletingVerifyId: number | null;
  editingCommentInvalid?: boolean;
  onStartEdit: (v: VerificationViewModel) => void;
  onCancelEdit: () => void;
  onSubmitEdit: () => void;
  onDelete: (id: number) => void;
  onEditCommentChange: (comment: string) => void;
  onEditImageChange: (file: File) => void;
  onRemoveEditImage?: () => void;
  isLoggedIn: boolean;
  myAvatarNumber: number;
};

const VerificationItem = ({
  v,
  editingVerifyId,
  editingPreviewUrl,
  editingComment,
  editingRemovedImage,
  deletingVerifyId,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onEditCommentChange,
  onEditImageChange,
  onRemoveEditImage,
  isLoggedIn,
  myAvatarNumber,
  editingCommentInvalid,
}: VerificationItemProps) => {
  const { src: protectedSrc } = useProtectedImage(v.fileId);

  const imageForDisplay = (() => {
    if (editingVerifyId === v.id) {
      return editingPreviewUrl ?? (v.fileId ? protectedSrc ?? v.imageUrl : v.imageUrl);
    }
    return v.fileId ? protectedSrc ?? v.imageUrl : v.imageUrl;
  })();

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
        editingVerifyId === v.id ? "border-yellow-600 ring-4 ring-yellow-500/40" : "border-[#efceb6]"
      }`}
    >
      {/* 유저 정보 */}
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg border border-[#929675]">
          <img
            src={v.isMine ? getAvatarPath(myAvatarNumber) : getAvatarPath(v.avatarNumber)}
            alt="User Avatar"
            className="h-16 w-16 object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{v.userName}</span>
        </div>
        {/* 수정/삭제 버튼 */}
        {isLoggedIn && v.isMine && editingVerifyId !== v.id && (
          <div className="ml-auto flex items-center gap-2 h-8">
            <button
              onClick={() => onStartEdit(v)}
              className="relative w-15 h-10 flex items-center justify-center transition active:scale-95 hover:brightness-110"
              style={{ backgroundImage: "url('/button_edit_feed.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
            >
              <span className="text-[13px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">수정</span>
            </button>
            <button
              onClick={() => onDelete(v.id)}
              disabled={deletingVerifyId === v.id}
              className="relative w-15 h-10 flex items-center justify-center transition active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:grayscale"
              style={{ backgroundImage: "url('/button_delete_feed.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
            >
              <span className="text-[13px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">{deletingVerifyId === v.id ? "..." : "삭제"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 인증 이미지 */}
      <div className="relative aspect-video w-full bg-gray-100">
        {(editingVerifyId === v.id && editingRemovedImage) || !(imageForDisplay) ? (
          <div className="w-full h-full flex items-center justify-center bg-[#fbf6e3]">
            <img src="/feed_noimage.png" alt="No image" className="w-40 h-40 object-contain opacity-40" />
          </div>
        ) : (
          <img
            src={imageForDisplay}
            alt="Verification"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
            }}
          />
        )}

        {editingVerifyId === v.id && (
          <button
            onClick={onRemoveEditImage}
            className="absolute top-2 right-2 w-22 h-10 flex items-center justify-center transition active:scale-95 hover:brightness-110"
            style={{ backgroundImage: "url('/button_delete_feed.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
          >
            <span className="text-[12px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">이미지 삭제</span>
          </button>
        )}

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
            className="absolute bottom-2 right-2 w-15 h-9 flex items-center justify-center transition active:scale-95 hover:brightness-110"
            style={{ backgroundImage: "url('/button_edit_feed.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
          >
            <span className="text-[13px] font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">변경</span>
          </button>
        )}
      </div>

      {/* 코멘트 및 버튼 영역 */}
      {editingVerifyId === v.id ? (
        <div className="relative w-full bg-[length:100%_100%] bg-no-repeat p-6 space-y-3" style={{ backgroundImage: "url('/feed_comment_bg.png')" }}>
          <textarea
            value={editingComment ?? ""}
            onChange={(e) => onEditCommentChange(e.target.value)}
            placeholder="한줄 소감을 남겨주세요."
            className={`w-full rounded-lg bg-white/50 p-2 text-sm outline-none text-[#482e17] ${
              editingCommentInvalid ? "border-red-500 ring-2 ring-red-500" : "border-[#d6c6ac] focus:border-[#553b24]"
            }`}
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={onSubmitEdit}
              className="relative flex-1 h-10 flex items-center justify-center transition active:scale-95 hover:brightness-110"
              style={{ backgroundImage: "url('/button_edit_feed_wide.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
            >
              <span className="text-sm font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">기록</span>
            </button>
            <button
              onClick={onCancelEdit}
              className="relative flex-1 h-10 flex items-center justify-center transition active:scale-95 hover:brightness-110"
              style={{ backgroundImage: "url('/button_edit_feed_cancel_wide.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
            >
              <span className="text-sm font-bold text-[#fffdf2] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">취소</span>
            </button>
          </div>
        </div>
      ) : (
        v.comment && (
          <div className="relative w-full bg-[length:100%_100%] bg-no-repeat p-6 flex items-center max-h-[55px]" style={{ backgroundImage: "url('/feed_comment_bg.png')" }}>
            <p className="text-sm font-medium text-[#482e17] leading-relaxed">{v.comment}</p>
          </div>
        )
      )}
    </div>
  );
};

export const VerificationFeed = ({
  verifications,
  editingVerifyId,
  editingComment,
  editingPreviewUrl,
  editingRemovedImage,
  deletingVerifyId,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onEditCommentChange,
  onEditImageChange,
  onRemoveEditImage,
  editingCommentInvalid,
}: VerificationFeedProps) => {

  const { token: storeToken, user } = useAuthStore();
  const myAvatarNumber = user?.avatarNumber ?? 0;
    
  // 스토어의 토큰 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!storeToken;

  

  if (verifications.length === 0) {
    return (
      <div className="flex flex-row items-center justify-center py-10 text-[#443321] text-sm bg-[#fef8e8] shadow-lg shadow-amber-900/20 rounded-2xl border-2 border-dashed border-gray-100 gap-4 px-6">
        <img src="/icon_norecord.png" alt="No records" className="w-15 h-15 opacity-80 shrink-0" />
        <div className="text-left leading-relaxed">
          아직 남긴 흔적이 없습니다.
          <br />사진 한 장, 글 한 줄을 남겨보세요.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {verifications.map((v) => (
        <VerificationItem
          key={`${v.id}-${v.imageUrl || 'no-image'}-${v.fileId || 'no-file'}`}
          v={v}
          editingVerifyId={editingVerifyId}
          editingPreviewUrl={editingPreviewUrl}
          editingComment={editingComment}
          editingRemovedImage={editingRemovedImage}
          deletingVerifyId={deletingVerifyId}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSubmitEdit={onSubmitEdit}
          onDelete={onDelete}
          onEditCommentChange={onEditCommentChange}
          onEditImageChange={onEditImageChange}
          onRemoveEditImage={onRemoveEditImage}
          editingCommentInvalid={editingCommentInvalid}
          isLoggedIn={isLoggedIn}
          myAvatarNumber={myAvatarNumber}
        />
      ))}
    </div>
  );
};
