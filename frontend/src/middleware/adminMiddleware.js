import adminAxiosInstance from './adminAxiosInstance';

/* LOGIN */

export const adminLogin = async (data) => {
  const { data: response } = await adminAxiosInstance.post('/admin/login', data);
  return response;
};

/* LOGOUT */

export const adminLogout = async () => {
  const { data } = await adminAxiosInstance.post('/admin/logout');
  return data;
};

/* ANALYTICS */

export const getAdminAnalytics = async () => {
  const { data } = await adminAxiosInstance.get('/admin/analytics');
  return data;
};

/* USERS */

export const getAllUsers = async () => {
  const { data } = await adminAxiosInstance.get('/admin/users');
  return data;
};

export const updateUser = async (userId, payload) => {
  const { data } = await adminAxiosInstance.put(`/admin/users/${userId}`, payload);
  return data;
};

export const enableUser = async (userId) => {
  const { data } = await adminAxiosInstance.patch(`/admin/users/${userId}/enable`);
  return data;
};

export const disableUser = async (userId) => {
  const { data } = await adminAxiosInstance.patch(`/admin/users/${userId}/disable`);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await adminAxiosInstance.delete(`/admin/users/${userId}`);
  return data;
};

/* MEMORIES */

export const getAllMemories = async () => {
  const { data } = await adminAxiosInstance.get('/admin/memories');
  return data;
};

export const deleteChatAdmin = async (chatId) => {
  const { data } = await adminAxiosInstance.delete(`/admin/chats/${chatId}`);
  return data;
};

export const deleteMessageAdmin = async (messageId) => {
  const { data } = await adminAxiosInstance.delete(`/admin/messages/${messageId}`);
  return data;
};

/* SYSTEM */

export const getSystemData = async () => {
  const { data } = await adminAxiosInstance.get('/admin/data');
  return data;
};

export const deleteLog = async (logId) => {
  const { data } = await adminAxiosInstance.delete(`/admin/logs/${logId}`);
  return data;
};

export const clearCache = async () => {
  const { data } = await adminAxiosInstance.delete('/admin/cache/clear');
  return data;
};

/* MEDIA */

export const getAllMedia = async () => {
  const { data } = await adminAxiosInstance.get('/admin/media');
  return data;
};

export const deleteMedia = async (mediaId) => {
  const { data } = await adminAxiosInstance.delete(`/admin/media/${mediaId}`);
  return data;
};
