import axiosInstance from "@/api/axios";

export const loginApi = (credentials) => {
  const formData = new FormData();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  return axiosInstance.post("/api/web-login", formData);
};

export const logoutApi = () => {
  return axiosInstance.post("/api/web-logout", "");
};

export const changePasswordApi = (data) => {
  const formData = new FormData();
  formData.append("username", data.username || "");
  formData.append("old_password", data.old_password || data.oldPassword || "");
  formData.append("new_password", data.new_password || data.newPassword || "");
  return axiosInstance.post("/api/web-change-password", formData);
};

export const forgotPasswordApi = (data) => {
  const formData = new FormData();
  formData.append("username", data.username || "");
  formData.append("email", data.email || "");
  return axiosInstance.post("/api/web-send-password", formData);
};
