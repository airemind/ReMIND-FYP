import axiosInstance from './axiosInstance';

// SAVE PROFILE SETUP
export const saveProfileSetup = async (data) => {
  const response = await axiosInstance.post('/profiles/setup', data);
  return response.data;
};
