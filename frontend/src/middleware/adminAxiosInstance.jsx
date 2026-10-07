import axios from 'axios';

const adminAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/* REQUEST INTERCEPTOR */

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR */

adminAxiosInstance.interceptors.response.use(
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
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');

        if (window.location.pathname !== '/admin-portal') {
          window.location.replace('/admin-portal');
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

export default adminAxiosInstance;
