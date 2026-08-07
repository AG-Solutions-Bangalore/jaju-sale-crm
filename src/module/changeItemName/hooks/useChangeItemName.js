import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProductList, changeBulkItemName } from "../api/changeItemName";
import { useToast } from "@/hooks/use-toast";

export const useProductList = () => {
  return useQuery({
    queryKey: ["productTypeGroupsNew"],
    queryFn: async () => {
      const response = await fetchProductList();
      const list =
        response?.data?.data ||
        response?.data?.product_type ||
        response?.data?.product_type_group ||
        response?.data?.product_type_group_new ||
        response?.data ||
        [];
      return Array.isArray(list) ? list : [];
    },
  });
};

export const useChangeBulkItemName = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeBulkItemName,
    onSuccess: (res) => {
      const code = res?.data?.code;
      const status = res?.data?.status;
      const isSuccess =
        code === 200 ||
        code === "200" ||
        status === "success" ||
        status === true ||
        res?.status === 200;

      if (isSuccess) {
        toast({
          title: "Item Name Updated Successfully",
          description:
            res?.data?.msg ||
            res?.data?.message ||
            "The item name has been bulk updated across all records.",
        });
        queryClient.invalidateQueries(["productType"]);
        queryClient.invalidateQueries(["stocksReport"]);
        queryClient.invalidateQueries(["productTypeGroupsNew"]);
        queryClient.invalidateQueries(["sales"]);
        queryClient.invalidateQueries(["purchase"]);
        queryClient.invalidateQueries(["estimate"]);
      } else {
        toast({
          title: "Update Failed",
          description:
            res?.data?.msg ||
            res?.data?.message ||
            "Failed to bulk update item name.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Update Error",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          "An error occurred while updating the item name.",
        variant: "destructive",
      });
    },
  });
};
