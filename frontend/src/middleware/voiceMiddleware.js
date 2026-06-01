import axiosInstance from './axiosInstance';

/* VOICE PROCESSING */

export const uploadVoice = async (formData) => {
  const response = await axiosInstance.post(
    '/voice-processing/upload',

    formData,

    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};
