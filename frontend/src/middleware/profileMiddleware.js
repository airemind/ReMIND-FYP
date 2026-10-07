import axiosInstance from './axiosInstance';

/* PROFILE */

export const saveProfileSetup = async (payload) => {
  const { data } = await axiosInstance.post('/profiles/setup', payload);
  return data;
};
