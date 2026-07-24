import axiosInstance from "@/api/axios";

export const fetchSales = () => {
  return axiosInstance.get("/api/sales");
};

export const fetchPurchases = () => {
  return axiosInstance.get("/api/purchase");
};

export const fetchDashboard = () => {
  return axiosInstance.get("/api/dashboard");
};
