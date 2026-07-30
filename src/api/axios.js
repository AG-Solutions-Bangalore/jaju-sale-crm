import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import Cookies from "js-cookie";
import { logoutUser } from "@/lib/queryClient";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API response interceptor error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/api/web-login");
      if (!isLoginRequest) {
        console.warn("Unauthorized 401 on non-login request, logging out...");
        logoutUser();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
