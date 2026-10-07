import axiosInstance from './axiosInstance';

/* LOGIN */

export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();

  formData.append('username', credentials.email || credentials.username);
  formData.append('password', credentials.password);

  const { data } = await axiosInstance.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return data;
};

/* SIGNUP */

export const signupUser = async (payload) => {
  const { data } = await axiosInstance.post('/auth/register', payload);
  return data;
};

/* GOOGLE LOGIN */

export const googleLogin = async (payload) => {
  const { data } = await axiosInstance.post('/auth/google', payload);
  return data;
};

/* LOGOUT */

export const logoutUser = async () => {
  const { data } = await axiosInstance.post('/auth/logout');
  return data;
};

/* TOKEN */

export const saveToken = (token) => {
  localStorage.setItem('token', token);
};
