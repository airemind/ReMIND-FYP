import axiosInstance from './axiosInstance';

/* UPLOAD VOICE */

export const uploadVoice = async (formData) => {
  const { data } = await axiosInstance.post('/voice-processing/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};
