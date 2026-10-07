import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/* REQUEST */

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* RESPONSE */

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (!error.response) {
      console.error('Network Error');
      return Promise.reject(error);
    }

    switch (status) {
      case 401:
      case 403:
        localStorage.removeItem('token');

        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        break;

      case 500:
        console.error('Internal Server Error');
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
