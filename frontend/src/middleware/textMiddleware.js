import axiosInstance from './axiosInstance';

/* TEXT PROCESSING */

export const processTextChat = async (data) => {
  const response = await axiosInstance.post(
    '/text-processing/chat',

    data
  );

  return response.data;
};

/* USER HISTORY */

export const getUserHistory = async (userId) => {
  const response = await axiosInstance.get(`/text-processing/history/user/${userId}`);

  return response.data;
};

/* CHAT HISTORY */

export const getChatHistory = async (chatId) => {
  const response = await axiosInstance.get(`/text-processing/history/chat/${chatId}`);

  return response.data;
};

/* SINGLE CONVERSATION */

export const getConversation = async (conversationId) => {
  const response = await axiosInstance.get(`/text-processing/history/${conversationId}`);

  return response.data;
};
