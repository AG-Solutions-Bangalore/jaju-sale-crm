import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSalesList,
  fetchCurrentYear,
  fetchProductTypeGroupNew,
  fetchProductTypeGroup,
  fetchEstimateById,
  createSales,
  createSalesDirect,
  fetchSalesById,
  deleteSalesSubItem,
  updateSalesDirect,
  fetchSalesReport,
  deleteSales,
} from "../api/sales";
import { useToast } from "@/hooks/use-toast";

export const useSalesList = (page = 1) => {
  return useQuery({
    queryKey: ["sales", page],
    queryFn: async () => {
      const response = await fetchSalesList(page);
      const rawData = response?.data;
      
      let salesData = [];
      let pagination = null;
      
      if (rawData?.data && Array.isArray(rawData.data.data)) {
        salesData = rawData.data.data;
        pagination = {
          current_page: rawData.data.current_page,
          last_page: rawData.data.last_page,
          per_page: rawData.data.per_page,
          total: rawData.data.total,
        };
      } else if (Array.isArray(rawData?.sales)) {
        salesData = rawData.sales;
      } else if (Array.isArray(rawData?.data)) {
        salesData = rawData.data;
      } else if (Array.isArray(rawData)) {
        salesData = rawData;
      }
      
      return {
        sales: salesData,
        pagination,
      };
    },
  });
};

export const useCurrentYear = () => {
  return useQuery({
    queryKey: ["currentYear"],
    queryFn: async () => {
      const response = await fetchCurrentYear();
      return response.data.year?.current_year;
    },
  });
};

export const useProductTypeGroupNew = () => {
  return useQuery({
    queryKey: ["productTypeGroupNew"],
    queryFn: async () => {
      const response = await fetchProductTypeGroupNew();
      return (
        response.data.data ||
        response.data.product_type ||
        response.data.product_type_group ||
        response.data.product_type_group_new ||
        []
      );
    },
  });
};

export const useProductTypeGroup = () => {
  return useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const response = await fetchProductTypeGroup();
      return response.data.product_type_group || [];
    },
  });
};

export const useEstimateById = (id) => {
  return useQuery({
    queryKey: ["estimate", id],
    queryFn: async () => {
      const response = await fetchEstimateById(id);
      return response.data;
    },
    enabled: !!id,
  });
};



export const useCreateSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSales,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Sales Created Successfully from Estimate",
      });
      queryClient.invalidateQueries(["sales"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Sales",
        variant: "destructive",
      });
    },
  });
};

export const useCreateSalesDirect = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalesDirect,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Direct Sales Created Successfully",
      });
      queryClient.invalidateQueries(["sales"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Direct Sales",
        variant: "destructive",
      });
    },
  });
};

export const useSalesById = (id) => {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const response = await fetchSalesById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeleteSalesSubItem = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteSalesSubItem,
    onSuccess: (data) => {
      toast({
        title: "Deleted",
        description: data.msg || "Sub item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete sub item",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSalesDirect = (id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateSalesDirect(id, payload),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Sales Updated Successfully",
      });
      queryClient.invalidateQueries(["sales"]);
      queryClient.invalidateQueries(["sales", id]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Sales",
        variant: "destructive",
      });
    },
  });
};

export const useSalesReport = (fromDate, toDate) => {
  return useQuery({
    queryKey: ["salesReport", fromDate, toDate],
    queryFn: async () => {
      const response = await fetchSalesReport({ from_date: fromDate, to_date: toDate });
      return response.data;
    },
    enabled: !!fromDate && !!toDate,
  });
};

export const useDeleteSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSales,
    onSuccess: (data) => {
      toast({
        title: "Deleted",
        description: data?.data?.msg || "Sales deleted successfully",
      });
      queryClient.invalidateQueries(["sales"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete Sales",
        variant: "destructive",
      });
    },
  });
};
