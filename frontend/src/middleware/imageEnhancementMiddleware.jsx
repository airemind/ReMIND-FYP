import axiosInstance from './axiosInstance';

// ENHANCE IMAGE
export const enhanceImage = async (imageFile) => {
  const formData = new FormData();

  formData.append('file', imageFile);

  const { data } = await axiosInstance.post('/image-ai/enhance', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 0
  });

  // Convert local backend path into a full URL
  if (data.enhanced_url?.startsWith('/')) {
    data.enhanced_url = `${process.env.REACT_APP_API_BASE_URL}${data.enhanced_url}`;
  }

  return data;
};
