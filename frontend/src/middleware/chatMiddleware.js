import axiosInstance from './axiosInstance';

// GET CHATS
export const getChats = async () => {
  const response = await axiosInstance.get('/chats/');
  return response.data;
};

// CREATE CHAT
export const createChat = async (data = {}) => {
  const response = await axiosInstance.post('/chats/', data);
  return response.data;
};

// DELETE CHAT
export const deleteChatById = async (chatId) => {
  const response = await axiosInstance.delete(`/chats/${chatId}`);
  return response.data;
};

// RENAME CHAT
export const renameChatById = async (chatId, data) => {
  const response = await axiosInstance.patch(`/chats/${chatId}`, data);
  return response.data;
};
