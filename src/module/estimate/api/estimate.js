import axiosInstance from "@/api/axios";

export const fetchEstimateList = () => {
  return axiosInstance.get("/api/estimate");
};

export const fetchCurrentYear = () => {
  return axiosInstance.get("/api/web-fetch-year");
};

export const fetchProductTypeGroup = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const fetchLatestEstimateRef = () => {
  return axiosInstance.get("/api/web-fetch-estimate-latest/2023-24");
};

export const createEstimate = (payload) => {
  return axiosInstance.post("/api/estimate", payload);
};

export const fetchEstimateById = (id) => {
  return axiosInstance.get(`/api/estimate/${id}`);
};

export const updateEstimate = (id, payload) => {
  return axiosInstance.put(`/api/estimate/${id}`, payload);
};

export const deleteEstimateSubItem = (subId) => {
  return axiosInstance.delete(`/api/delete-estimate-sub/${subId}`);
};

export const deleteEstimate = (id) => {
  return axiosInstance.delete(`/api/estimate/${id}`);
};
