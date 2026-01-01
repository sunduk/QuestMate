import api from "../../../lib/axios";

// ----------------------------------------------------------------------
// [퀘스트 조회]
// ----------------------------------------------------------------------
export const fetchQuestDetail = async (questId: string) => {
  const response = await api.get(`/quest/${questId}`);
  return response.data;
};

// ----------------------------------------------------------------------
// [멤버십]
// ----------------------------------------------------------------------
export const joinQuest = async (questId: number) => {
  const response = await api.post("/quest/join", { questId });
  return response.data;
};

export const leaveQuest = async (questId: number) => {
  const response = await api.post("/quest/leave", { questId });
  return response.data;
};

// ----------------------------------------------------------------------
// [인증샷 CRUD]
// ----------------------------------------------------------------------
export const uploadVerification = async (questId: number, image: File, comment: string) => {
  const formData = new FormData();
  formData.append("QuestId", questId.toString());
  formData.append("Comment", comment || "");
  formData.append("Image", image);

  const response = await api.post("/quest/verify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateVerification = async (
  questId: number,
  verificationId: number,
  comment: string,
  image?: File
) => {
  const formData = new FormData();
  formData.append("QuestId", questId.toString());
  formData.append("VerificationId", verificationId.toString());
  formData.append("Comment", comment);
  if (image) {
    formData.append("Image", image);
  }

  const response = await api.post("/quest/verify/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteVerification = async (questId: number, verificationId: number) => {
  const response = await api.post("/quest/verify/delete", {
    QuestId: questId,
    VerificationId: verificationId,
  });
  return response.data;
};
