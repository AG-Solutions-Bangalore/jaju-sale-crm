import { useQuery } from "@tanstack/react-query";
import { fetchSales, fetchPurchases, fetchDashboard } from "../api/home";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const response = await fetchDashboard();
      return response.data?.data || response.data || {};
    },
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: ["salesData"],
    queryFn: async () => {
      const response = await fetchSales();
      return response.data.sales || [];
    },
  });
};

export const usePurchases = () => {
  return useQuery({
    queryKey: ["purchaseGraniteData"],
    queryFn: async () => {
      const response = await fetchPurchases();
      return response.data.purchase || [];
    },
  });
};
