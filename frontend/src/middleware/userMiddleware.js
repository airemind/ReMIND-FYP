import axiosInstance from './axiosInstance';

/* USER */

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get('/users/me');
  return data;
};
