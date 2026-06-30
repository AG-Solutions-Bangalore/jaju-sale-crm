import axiosInstance from "@/api/axios";

export const fetchSales = () => {
  return axiosInstance.get("/api/web-fetch-sales-list");
};

export const fetchPurchases = () => {
  return axiosInstance.get("/api/web-fetch-purchase-lists");
};
