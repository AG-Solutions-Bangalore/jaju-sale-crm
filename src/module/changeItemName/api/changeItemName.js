import axiosInstance from "@/api/axios";

export const fetchProductList = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const changeBulkItemName = (payload) => {
  const formData = new FormData();
  formData.append("from_item_name", payload.from_item_name || "");
  formData.append("to_item_name", payload.to_item_name || "");
  return axiosInstance.post("/api/changebulkitemName", formData);
};
