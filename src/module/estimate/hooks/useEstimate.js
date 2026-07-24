import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEstimateList,
  fetchCurrentYear,
  fetchProductTypeGroup,
  fetchLatestEstimateRef,
  createEstimate,
  fetchEstimateById,
  updateEstimate,
  deleteEstimate,
} from "../api/estimate";
import { useToast } from "@/hooks/use-toast";

export const useEstimateList = () => {
  return useQuery({
    queryKey: ["estimate"],
    queryFn: async () => {
      const response = await fetchEstimateList();
      const rawData = response?.data;
      if (Array.isArray(rawData?.data?.data)) return rawData.data.data;
      if (Array.isArray(rawData?.estimate)) return rawData.estimate;
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

export const useProductTypeGroup = () => {
  return useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const response = await fetchProductTypeGroup();
      const list =
        response.data?.data ||
        response.data?.product_type ||
        response.data?.product_type_group ||
        response.data?.product_type_group_new ||
        response.data ||
        [];
      return Array.isArray(list) ? list : [];
    },
  });
};



export const useLatestEstimateRef = () => {
  return useQuery({
    queryKey: ["latestEstimateRef"],
    queryFn: async () => {
      const response = await fetchLatestEstimateRef();
      return response.data?.estimateRef || "";
    },
  });
};

export const useCreateEstimate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEstimate,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Estimate Created Successfully",
      });
      queryClient.invalidateQueries(["estimate"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Estimate",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEstimate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateEstimate(id, payload),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Estimate Updated Successfully",
      });
      queryClient.invalidateQueries(["estimate"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Estimate",
        variant: "destructive",
      });
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

export const useDeleteEstimate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEstimate,
    onSuccess: (data) => {
      toast({
        title: "Deleted",
        description: data?.data?.msg || "Estimate deleted successfully",
      });
      queryClient.invalidateQueries(["estimate"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete Estimate",
        variant: "destructive",
      });
    },
  });
};
