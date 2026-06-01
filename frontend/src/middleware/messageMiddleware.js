import axiosInstance from './axiosInstance';

// GET MESSAGES
export const getMessages = async (chatId) => {
  const response = await axiosInstance.get(`/messages/${chatId}`);

  return response.data;
};

// SEND MESSAGE
export const sendMessageApi = async (chatId, data) => {
  const response = await axiosInstance.post(`/messages/${chatId}`, data);

  return response.data;
};
