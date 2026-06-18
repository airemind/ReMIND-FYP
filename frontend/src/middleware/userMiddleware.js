import axiosInstance from './axiosInstance';

// CURRENT USER
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
};
