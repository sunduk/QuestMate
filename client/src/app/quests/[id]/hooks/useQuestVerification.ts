import { useState } from "react";
import { isAxiosError } from "axios";
import { uploadVerification, updateVerification, deleteVerification } from "../api";
import { QuestViewModel, VerificationViewModel } from "../types";

export const useQuestVerification = (
  quest: QuestViewModel | null,
  setQuest: React.Dispatch<React.SetStateAction<QuestViewModel | null>>
) => {
  // 업로드
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyImage, setVerifyImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  // 수정
  const [editingVerifyId, setEditingVerifyId] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<File | null>(null);
  const [editingPreviewUrl, setEditingPreviewUrl] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string>("");
  const [editingRemovedImage, setEditingRemovedImage] = useState<boolean>(false);

  // 삭제
  const [deletingVerifyId, setDeletingVerifyId] = useState<number | null>(null);

  // ----------------------------------------------------------------------
  // [업로드]
  // ----------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setVerifyImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmitVerify = async () => {
    if (!quest) return;
    const confirmMsg = verifyImage ? "이 사진으로 인증하시겠습니까?" : "사진 없이 인증하시겠습니까?";
    if (!confirm(confirmMsg)) return;

    setIsVerifying(true);

    try {
      const result = await uploadVerification(quest.id, verifyImage, comment);

      if (result.success) {
        alert("인증 완료! 오늘도 한 걸음 성장하셨네요! 💪");
        setVerifyImage(null);
        setPreviewUrl(null);
        setComment("");
        window.location.reload();
      } else {
        alert(result.error || "인증 실패");
      }
    } catch (err) {
      console.error("Verify Failed:", err);
      if (isAxiosError(err)) {
        alert(`업로드 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ----------------------------------------------------------------------
  // [수정]
  // ----------------------------------------------------------------------
  const startEdit = (verification: VerificationViewModel) => {
    setEditingVerifyId(verification.id);
    setEditingComment(verification.comment);
    setEditingPreviewUrl(verification.imageUrl ?? null);
    setEditingImage(null);
    setEditingRemovedImage(false);
  };

  const cancelEdit = () => {
    setEditingVerifyId(null);
    setEditingImage(null);
    setEditingPreviewUrl(null);
    setEditingComment("");
    setEditingRemovedImage(false);
  };

  const handleEditImageChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setEditingImage(file);
    setEditingPreviewUrl(URL.createObjectURL(file));
    setEditingRemovedImage(false);
  };

  // 편집 중인 이미지 제거 (미리보기/파일 초기화)
  const handleRemoveEditImage = () => {
    setEditingImage(null);
    setEditingPreviewUrl(null);
    setEditingRemovedImage(true);
  };

  const handleSubmitEdit = async () => {
    if (!quest || editingVerifyId === null) {
      alert("수정할 인증샷이 없습니다.");
      return;
    }

    try {
      const result = await updateVerification(
        quest.id,
        editingVerifyId,
        editingComment,
        editingImage || undefined
      );

      if (result.success) {
        console.log("Verify Edit Success:", result);
        setQuest((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            verifications: prev.verifications.map((v) =>
              v.id === editingVerifyId
                ? {
                    ...v,
                    comment: editingComment,
                    imageUrl: editingRemovedImage ? "" : editingPreviewUrl || v.imageUrl,
                  }
                : v
            ),
          };
        });
        cancelEdit();
      } else {
        alert(result.error || "수정 실패");
      }
    } catch (err) {
      console.error("Verify Edit Failed:", err);
      if (isAxiosError(err)) {
        alert(`수정 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    }
  };

  // ----------------------------------------------------------------------
  // [삭제]
  // ----------------------------------------------------------------------
  const handleDelete = async (verifyId: number) => {
    if (!quest) return;
    if (!window.confirm("정말 이 인증샷을 삭제하시겠습니까?")) return;

    setDeletingVerifyId(verifyId);

    try {
      const result = await deleteVerification(quest.id, verifyId);

      if (result.success) {
        alert("인증샷이 삭제되었습니다.");
        setQuest((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            verifications: prev.verifications.filter((v) => v.id !== verifyId),
            participants: prev.participants.map((p) =>
              p.isMe ? { ...p, current: Math.max(0, p.current - 1) } : p
            ),
          };
        });
      } else {
        alert(result.error || "삭제 실패");
      }
    } catch (err) {
      console.error("Verify Delete Failed:", err);
      if (isAxiosError(err)) {
        alert(`삭제 실패: ${err.response?.data?.error || "서버 오류"}`);
      }
    } finally {
      setDeletingVerifyId(null);
    }
  };

  return {
    // 업로드
    isVerifying,
    verifyImage,
    previewUrl,
    comment,
    setComment,
    setPreviewUrl,
    setVerifyImage,
    handleFileChange,
    handleSubmitVerify,

    // 수정
    editingVerifyId,
    editingComment,
    editingPreviewUrl,
    editingRemovedImage,
    setEditingComment,
    startEdit,
    cancelEdit,
    handleEditImageChange,
    handleRemoveEditImage,
    handleSubmitEdit,

    // 삭제
    deletingVerifyId,
    handleDelete,
  };
};
