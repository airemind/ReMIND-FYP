import axiosInstance from './axiosInstance';

/* TEXT */

export const processTextChat = async (payload) => {
  const { data } = await axiosInstance.post('/text-processing/chat', payload);
  return data;
};

/* HISTORY */

export const getUserHistory = async (userId) => {
  const { data } = await axiosInstance.get(`/text-processing/history/user/${userId}`);
  return data;
};

export const getChatHistory = async (chatId) => {
  const { data } = await axiosInstance.get(`/text-processing/history/chat/${chatId}`);
  return data;
};

export const getConversation = async (conversationId) => {
  const { data } = await axiosInstance.get(`/text-processing/history/${conversationId}`);
  return data;
};
