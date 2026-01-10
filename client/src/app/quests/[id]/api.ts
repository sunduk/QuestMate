import api from "../../../lib/axios";

// ----------------------------------------------------------------------
// [퀘스트 조회]
// ----------------------------------------------------------------------
export const fetchQuestDetail = async (publicId: string) => {
  const response = await api.get(`/quest/${publicId}`);
  return response.data;
};

// ----------------------------------------------------------------------
// [멤버십]
// ----------------------------------------------------------------------
export const joinQuest = async (publicId: string) => {
  const response = await api.post("/quest/join", { publicId });
  return response.data;
};

export const leaveQuest = async (publicId: string) => {
  const response = await api.post("/quest/leave", { publicId });
  return response.data;
};

// ----------------------------------------------------------------------
// [인증샷 CRUD]
// ----------------------------------------------------------------------
export const uploadVerification = async (
  publicId: string,
  image: File | null | undefined,
  comment: string
) => {
  const formData = new FormData();
  formData.append("PublicId", publicId);
  formData.append("Comment", comment || "");
  if (image) {
    formData.append("Image", image);
  }

  const response = await api.post("/quest/verify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


export const updateVerification = async (
  publicId: string,
  verificationId: number,
  comment: string,
  image?: File | null,
  removeImage?: boolean
) => {
  const formData = new FormData();
  formData.append("PublicId", publicId.toString());
  formData.append("VerificationId", verificationId.toString());
  formData.append("Comment", comment);
  // Append image only when an actual File is provided (user selected new file)
  if (image instanceof File) {
    formData.append("Image", image);
  }

  // If caller explicitly requests image removal, include a flag so server can delete it.
  if (removeImage) {
    formData.append("RemoveImage", "true");
  }

  const response = await api.post("/quest/verify/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteVerification = async (publicId: string, verificationId: number) => {
  const response = await api.post("/quest/verify/delete", {
    PublicId: publicId,
    VerificationId: verificationId,
  });
  return response.data;
};
