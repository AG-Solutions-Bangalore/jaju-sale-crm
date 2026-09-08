import { useState, useEffect, useRef, useCallback } from "react";
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
import { runProgressivePaginationFetch } from "@/utils/paginationFetcher";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes cache validity

export const useSalesList = () => {
  const queryClient = useQueryClient();

  const getCachedSales = useCallback(() => {
    const cached = queryClient.getQueryData(["sales"]);
    const state = queryClient.getQueryState(["sales"]);
    const isFresh = Boolean(state && Date.now() - state.dataUpdatedAt < STALE_TIME && !state.isInvalidated);
    const hasData = Boolean(Array.isArray(cached?.sales) && cached.sales.length > 0);
    const isAllLoaded = Boolean(cached?.isAllDataLoaded);
    return { cached, isFresh, hasData, isAllLoaded };
  }, [queryClient]);

  const [data, setData] = useState(() => {
    const { cached, hasData } = getCachedSales();
    return hasData ? cached : { sales: [], pagination: null };
  });

  const [isLoading, setIsLoading] = useState(() => {
    const { hasData } = getCachedSales();
    return !hasData;
  });

  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  const [isAllDataLoaded, setIsAllDataLoaded] = useState(() => {
    const { isFresh, isAllLoaded } = getCachedSales();
    return isFresh && isAllLoaded;
  });

  const [loadedCount, setLoadedCount] = useState(() => {
    const { cached } = getCachedSales();
    return cached?.sales?.length || 0;
  });

  const [totalCount, setTotalCount] = useState(() => {
    const { cached } = getCachedSales();
    return cached?.pagination?.total || cached?.sales?.length || 0;
  });

  const abortControllerRef = useRef(null);
  const fetchCycleRef = useRef(0);

  const extractSalesPageData = useCallback((res) => {
    const rawData = res?.data;
    const raw = rawData?.data;

    let records = [];
    let lastPage = 1;
    let total = 0;
    let currentPage = 1;

    if (raw && Array.isArray(raw.data)) {
      records = raw.data;
      lastPage = raw.last_page || 1;
      total = raw.total || records.length;
      currentPage = raw.current_page || 1;
    } else if (rawData?.data && Array.isArray(rawData.data.data)) {
      records = rawData.data.data;
      lastPage = rawData.data.last_page || 1;
      total = rawData.data.total || records.length;
      currentPage = rawData.data.current_page || 1;
    } else if (Array.isArray(rawData?.sales)) {
      records = rawData.sales;
      total = rawData.sales.length;
    } else if (Array.isArray(rawData?.data)) {
      records = rawData.data;
      total = rawData.data.length;
    } else if (Array.isArray(rawData)) {
      records = rawData;
      total = rawData.length;
    }

    return { records, lastPage, total, currentPage };
  }, []);

  const startFetch = useCallback((force = false) => {
    if (!force) {
      const { cached, isFresh, hasData, isAllLoaded } = getCachedSales();
      if (hasData && isFresh && isAllLoaded) {
        // Data is already completely cached and fresh - skip all network requests!
        setData(cached);
        setIsLoading(false);
        setIsBackgroundLoading(false);
        setIsAllDataLoaded(true);
        setLoadedCount(cached.sales.length);
        setTotalCount(cached.pagination?.total || cached.sales.length);
        return;
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentCycle = ++fetchCycleRef.current;

    setIsError(false);
    setError(null);
    setIsAllDataLoaded(false);

    const { hasData } = getCachedSales();
    if (!hasData) {
      setIsLoading(true);
    }

    runProgressivePaginationFetch({
      fetchPage: (page, signal) => fetchSalesList(page, signal),
      extractPageData: extractSalesPageData,
      onInitialReady: ({ records, pagination, lastPage, total }) => {
        if (currentCycle !== fetchCycleRef.current) return;
        const isDone = lastPage <= 1;
        const payload = { sales: records, pagination, isAllDataLoaded: isDone };
        setData(payload);
        queryClient.setQueryData(["sales"], payload);
        setIsLoading(false);
        setLoadedCount(records.length);
        setTotalCount(total);
        if (lastPage > 1) {
          setIsBackgroundLoading(true);
        } else {
          setIsBackgroundLoading(false);
          setIsAllDataLoaded(true);
        }
      },
      onProgress: ({ records, loadedCount: lCount, totalCount: tCount, isComplete }) => {
        if (currentCycle !== fetchCycleRef.current) return;
        setData((prev) => {
          const payload = {
            sales: records,
            pagination: prev?.pagination
              ? { ...prev.pagination, total: tCount || records.length }
              : { current_page: 1, last_page: 1, per_page: records.length, total: tCount || records.length },
            isAllDataLoaded: isComplete,
          };
          queryClient.setQueryData(["sales"], payload);
          return payload;
        });
        setLoadedCount(lCount);
        setTotalCount(tCount);
        if (isComplete) {
          setIsBackgroundLoading(false);
          setIsAllDataLoaded(true);
        } else {
          setIsBackgroundLoading(true);
        }
      },
      onError: (err) => {
        if (currentCycle !== fetchCycleRef.current) return;
        setIsError(true);
        setError(err);
        setIsLoading(false);
        setIsBackgroundLoading(false);
      },
      signal: controller.signal,
      concurrency: 5,
    });
  }, [getCachedSales, queryClient, extractSalesPageData]);

  useEffect(() => {
    startFetch(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [startFetch]);

  // Listen for query invalidation triggered by mutations (createSalesDirect, updateSalesDirect, deleteSales)
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === "updated" &&
        event.query?.queryKey?.[0] === "sales" &&
        event.action?.type === "invalidate"
      ) {
        startFetch(true); // Force refetch when cache is invalidated!
      }
    });
    return () => unsubscribe();
  }, [queryClient, startFetch]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => startFetch(true),
    isBackgroundLoading,
    isAllDataLoaded,
    loadedCount,
    totalCount,
  };
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
