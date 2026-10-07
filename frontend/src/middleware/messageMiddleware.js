import axiosInstance from './axiosInstance';

/* MESSAGES */

export const getMessages = async (chatId) => {
  const { data } = await axiosInstance.get(`/messages/${chatId}`);
  return data;
};

export const sendMessageApi = async (chatId, payload) => {
  const { data } = await axiosInstance.post(`/messages/${chatId}`, payload);
  return data;
};
