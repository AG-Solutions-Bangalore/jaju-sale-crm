import axiosInstance from "@/api/axios";

export const fetchStockNewReport = (payload = {}) => {
  const formData = new FormData();
  formData.append("from_date", payload.from_date || "");
  formData.append("to_date", payload.to_date || "");
  formData.append("item_name", payload.item_name || "");
  return axiosInstance.post("/api/salesStock", formData);
};

export const fetchStockNewReportByItem = (payload = {}) => {
  const formData = new FormData();
  formData.append("from_date", payload.from_date || "");
  formData.append("to_date", payload.to_date || "");
  formData.append("item_name", payload.item_name || "");
  return axiosInstance.post("/api/salesStock", formData);
};

export const fetchProductTypeList = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const fetchProductTypeGroupNew = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const createProductType = (payload) => {
  return axiosInstance.post("/api/web-create-product-type", payload);
};

export const updateProductType = (id, payload) => {
  return axiosInstance.put(`/api/web-update-product-type/${id}`, payload);
};
