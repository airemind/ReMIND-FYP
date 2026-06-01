import adminAxiosInstance from "./adminAxiosInstance";

/* ADMIN LOGIN */

export const adminLogin = async (data) => {
  const response = await adminAxiosInstance.post(
    "/admin/login",

    data,
  );

  return response.data;
};

/* ADMIN LOGOUT */

export const adminLogout = async () => {
  const response = await adminAxiosInstance.post("/admin/logout");

  return response.data;
};

/* ANALYTICS */

export const getAdminAnalytics = async () => {
  const response = await adminAxiosInstance.get("/admin/analytics");

  return response.data;
};

/* ALL USERS */

export const getAllUsers = async () => {
  const response = await adminAxiosInstance.get("/admin/users");

  return response.data;
};

/* DISABLE USER */

export const disableUser = async (userId) => {
  const response = await adminAxiosInstance.patch(
    `/admin/users/${userId}/disable`,
  );

  return response.data;
};

/* ENABLE USER */

export const enableUser = async (userId) => {
  const response = await adminAxiosInstance.patch(
    `/admin/users/${userId}/enable`,
  );

  return response.data;
};

/* UPDATE USER */

export const updateUser = async (userId, data) => {
  const response = await adminAxiosInstance.put(
    `/admin/users/${userId}`,

    data,
  );

  return response.data;
};

/* DELETE USER */

export const deleteUser = async (userId) => {
  const response = await adminAxiosInstance.delete(`/admin/users/${userId}`);

  return response.data;
};

/* ALL MEMORIES */

export const getAllMemories = async () => {
  const response = await adminAxiosInstance.get("/admin/memories");

  return response.data;
};

/* DELETE CHAT */

export const deleteChatAdmin = async (chatId) => {
  const response = await adminAxiosInstance.delete(`/admin/chats/${chatId}`);

  return response.data;
};

/* DELETE MESSAGE */

export const deleteMessageAdmin = async (messageId) => {
  const response = await adminAxiosInstance.delete(
    `/admin/messages/${messageId}`,
  );

  return response.data;
};

/* SYSTEM DATA */

export const getSystemData = async () => {
  const response = await adminAxiosInstance.get("/admin/data");

  return response.data;
};

/* DELETE LOG */

export const deleteLog = async (logId) => {
  const response = await adminAxiosInstance.delete(`/admin/logs/${logId}`);

  return response.data;
};

/* CLEAR CACHE */

export const clearCache = async () => {
  const response = await adminAxiosInstance.delete("/admin/cache/clear");

  return response.data;
};

/* ALL MEDIA */

export const getAllMedia = async () => {
  const response = await adminAxiosInstance.get("/admin/media");

  return response.data;
};

/* DELETE MEDIA */

export const deleteMedia = async (mediaId) => {
  const response = await adminAxiosInstance.delete(`/admin/media/${mediaId}`);

  return response.data;
};
