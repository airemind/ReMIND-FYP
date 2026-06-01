import api from "./axiosInstance";

export const processMemory = async ({
  userPrompt,
  imageFile,
  audioFile,
  chatId,
  userId,
}) => {
  try {
    const formData = new FormData();

    /* USER ID */

    formData.append("user_id", userId);

    /* PROMPT */

    if (userPrompt) {
      formData.append("user_prompt", userPrompt);
    }

    /* CHAT */

    if (chatId) {
      formData.append("chat_id", String(chatId));
    }

    /* IMAGE */

    if (imageFile) {
      formData.append("image", imageFile);
    }

    /* AUDIO */

    if (audioFile) {
      formData.append("audio", audioFile);
    }

    const response = await api.post("/memory/process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);

    throw error;
  }
};
