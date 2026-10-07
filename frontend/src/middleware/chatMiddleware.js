import axiosInstance from './axiosInstance';

/* CHATS */

export const getChats = async () => {
  const { data } = await axiosInstance.get('/chats/');
  return data;
};

export const createChat = async (payload = {}) => {
  const { data } = await axiosInstance.post('/chats/', payload);
  return data;
};

export const deleteChatById = async (chatId) => {
  const { data } = await axiosInstance.delete(`/chats/${chatId}`);
  return data;
};

export const renameChatById = async (chatId, payload) => {
  const { data } = await axiosInstance.patch(`/chats/${chatId}`, payload);
  return data;
};
