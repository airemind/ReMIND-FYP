import axiosInstance from './axiosInstance';

/* IMAGE PROCESSING */
export const uploadFile = async (formData) => {
  const response = await axiosInstance.post('/image-processing/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
