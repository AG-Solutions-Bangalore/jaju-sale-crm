import axiosInstance from "@/api/axios";

export const fetchPurchaseList = () => {
  return axiosInstance.get("/api/purchase");
};

export const fetchPurchaseReport = (data) => {
  const formData = new FormData();
  formData.append("from_date", data.from_date || "");
  formData.append("to_date", data.to_date || "");
  return axiosInstance.post("/api/purchaseReport", formData);
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

export const createPurchase = (payload) => {
  return axiosInstance.post("/api/purchase", payload);
};

export const fetchPurchaseById = (id) => {
  return axiosInstance.get(`/api/purchase/${id}`);
};

export const deletePurchaseSubItem = (subId) => {
  return axiosInstance.delete(`/api/delete-purchase-sub/${subId}`);
};

export const updatePurchase = (id, payload) => {
  return axiosInstance.put(`/api/purchase/${id}`, payload);
};

export const deletePurchase = (id) => {
  return axiosInstance.delete(`/api/purchase/${id}`);
};
