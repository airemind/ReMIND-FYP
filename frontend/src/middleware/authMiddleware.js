import axiosInstance from './axiosInstance';

// LOGIN
export const loginUser = async (data) => {
  const formData = new URLSearchParams();

  formData.append('username', data.email || data.username);
  formData.append('password', data.password);

  const response = await axiosInstance.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

// SIGNUP
export const signupUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

/* GOOGLE LOGIN */
export const googleLogin = async (data) => {
  const response = await axiosInstance.post('/auth/google', data);
  return response.data;
};
// LOGOUT
export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// SAVE TOKEN
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};
