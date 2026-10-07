import axiosInstance from './axiosInstance';

/* PROCESS MEMORY */

export const processMemory = async ({ userPrompt, imageFile, audioFile, chatId, userId }) => {
  const formData = new FormData();

  formData.append('user_id', userId);

  if (userPrompt) {
    formData.append('user_prompt', userPrompt);
  }

  if (chatId) {
    formData.append('chat_id', String(chatId));
  }

  if (imageFile) {
    formData.append('image', imageFile);
  }

  if (audioFile) {
    formData.append('audio', audioFile);
  }

  const { data } = await axiosInstance.post('/memory/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};
