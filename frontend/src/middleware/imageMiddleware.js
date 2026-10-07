import axiosInstance from './axiosInstance';

/* UPLOAD IMAGE */

export const uploadFile = async (formData) => {
  const { data } = await axiosInstance.post('/image-processing/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};
