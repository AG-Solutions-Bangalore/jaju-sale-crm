import axiosInstance from "@/api/axios";

export const fetchSalesList = () => {
  return axiosInstance.get("/api/sales");
};

export const fetchCurrentYear = () => {
  return axiosInstance.get("/api/web-fetch-year");
};

export const fetchProductTypeGroupNew = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const fetchProductTypeGroup = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const fetchEstimateById = (id) => {
  return axiosInstance.get(`/api/estimate/${id}`);
};

export const createSales = (payload) => {
  return axiosInstance.post("/api/sales", payload);
};

export const createSalesDirect = (payload) => {
  return axiosInstance.post("/api/sales", payload);
};

export const fetchSalesById = (id) => {
  return axiosInstance.get(`/api/sales/${id}`);
};

export const deleteSalesSubItem = (subId) => {
  return axiosInstance.delete(`/api/delete-sales-sub/${subId}`);
};

export const updateSalesDirect = (id, payload) => {
  return axiosInstance.put(`/api/sales/${id}`, payload);
};

export const fetchSalesReport = (data) => {
  const formData = new FormData();
  formData.append("from_date", data.from_date || "");
  formData.append("to_date", data.to_date || "");
  return axiosInstance.post("/api/salesReport", formData);
};

export const deleteSales = (id) => {
  return axiosInstance.delete(`/api/sales/${id}`);
};
