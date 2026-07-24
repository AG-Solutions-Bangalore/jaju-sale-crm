import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchaseList,
  fetchPurchaseReport,
  fetchCurrentYear,
  fetchProductTypeGroupNew,
  fetchProductTypeGroup,
  createPurchase,
  fetchPurchaseById,
  deletePurchaseSubItem,
  updatePurchase,
  deletePurchase,
} from "../api/purchase";
import { useToast } from "@/hooks/use-toast";

export const usePurchaseList = () => {
  return useQuery({
    queryKey: ["purchaseGranite"],
    queryFn: async () => {
      const response = await fetchPurchaseList();
      const rawData = response?.data;
      if (Array.isArray(rawData?.data?.data)) return rawData.data.data;
      if (Array.isArray(rawData?.purchase)) return rawData.purchase;
      if (Array.isArray(rawData?.purchases)) return rawData.purchases;
      if (Array.isArray(rawData?.data)) return rawData.data;
      if (Array.isArray(rawData)) return rawData;
      return [];
    },
  });
};

export const usePurchaseReport = (fromDate, toDate) => {
  return useQuery({
    queryKey: ["purchaseReport", fromDate, toDate],
    queryFn: async () => {
      const response = await fetchPurchaseReport({ from_date: fromDate, to_date: toDate });
      const rawData = response?.data;
      if (Array.isArray(rawData?.data?.data)) return rawData.data.data;
      if (Array.isArray(rawData?.purchase)) return rawData.purchase;
      if (Array.isArray(rawData?.purchases)) return rawData.purchases;
      if (Array.isArray(rawData?.data)) return rawData.data;
      if (Array.isArray(rawData)) return rawData;
      return [];
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

export const useCreatePurchase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Purchase Created Successfully",
      });
      queryClient.invalidateQueries(["purchaseGranite"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Purchase",
        variant: "destructive",
      });
    },
  });
};

export const usePurchaseById = (id) => {
  return useQuery({
    queryKey: ["purchaseGranite", id],
    queryFn: async () => {
      const response = await fetchPurchaseById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeletePurchaseSubItem = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: deletePurchaseSubItem,
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

export const useUpdatePurchase = (id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updatePurchase(id, payload),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Purchase Updated Successfully",
      });
      queryClient.invalidateQueries(["purchaseGranite"]);
      queryClient.invalidateQueries(["purchaseGranite", id]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Purchase",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePurchase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchase,
    onSuccess: (data) => {
      toast({
        title: "Deleted",
        description: data?.data?.msg || "Purchase deleted successfully",
      });
      queryClient.invalidateQueries(["purchaseGranite"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete Purchase",
        variant: "destructive",
      });
    },
  });
};
