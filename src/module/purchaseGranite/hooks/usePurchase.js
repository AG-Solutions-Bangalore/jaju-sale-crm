import { useState, useEffect, useRef, useCallback } from "react";
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
import { runProgressivePaginationFetch } from "@/utils/paginationFetcher";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes cache validity

export const usePurchaseList = () => {
  const queryClient = useQueryClient();

  const getCachedPurchases = useCallback(() => {
    const cached = queryClient.getQueryData(["purchaseGranite"]);
    const state = queryClient.getQueryState(["purchaseGranite"]);
    const isFresh = Boolean(state && Date.now() - state.dataUpdatedAt < STALE_TIME && !state.isInvalidated);
    const hasData = Boolean(Array.isArray(cached) && cached.length > 0);
    const meta = queryClient.getQueryData(["purchaseGraniteMeta"]);
    const isAllLoaded = Boolean(meta?.isAllDataLoaded);
    return { cached, isFresh, hasData, isAllLoaded, meta };
  }, [queryClient]);

  const [data, setData] = useState(() => {
    const { cached, hasData } = getCachedPurchases();
    return hasData ? cached : [];
  });

  const [isLoading, setIsLoading] = useState(() => {
    const { hasData } = getCachedPurchases();
    return !hasData;
  });

  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  const [isAllDataLoaded, setIsAllDataLoaded] = useState(() => {
    const { isFresh, isAllLoaded } = getCachedPurchases();
    return isFresh && isAllLoaded;
  });

  const [loadedCount, setLoadedCount] = useState(() => {
    const { cached } = getCachedPurchases();
    return cached?.length || 0;
  });

  const [totalCount, setTotalCount] = useState(() => {
    const { meta, cached } = getCachedPurchases();
    return meta?.totalCount || cached?.length || 0;
  });

  const abortControllerRef = useRef(null);
  const fetchCycleRef = useRef(0);

  const extractPurchasePageData = useCallback((res) => {
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
    } else if (Array.isArray(rawData?.purchases)) {
      records = rawData.purchases;
      total = rawData.purchases.length;
    } else if (Array.isArray(rawData?.purchase)) {
      records = rawData.purchase;
      total = rawData.purchase.length;
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
      const { cached, isFresh, hasData, isAllLoaded, meta } = getCachedPurchases();
      if (hasData && isFresh && isAllLoaded) {
        // Data is already completely cached and fresh - skip all network requests!
        setData(cached);
        setIsLoading(false);
        setIsBackgroundLoading(false);
        setIsAllDataLoaded(true);
        setLoadedCount(cached.length);
        setTotalCount(meta?.totalCount || cached.length);
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

    const { hasData } = getCachedPurchases();
    if (!hasData) {
      setIsLoading(true);
    }

    runProgressivePaginationFetch({
      fetchPage: (page, signal) => fetchPurchaseList(page, signal),
      extractPageData: extractPurchasePageData,
      onInitialReady: ({ records, lastPage, total }) => {
        if (currentCycle !== fetchCycleRef.current) return;
        setData(records);
        queryClient.setQueryData(["purchaseGranite"], records);
        queryClient.setQueryData(["purchaseGraniteMeta"], {
          isAllDataLoaded: lastPage <= 1,
          totalCount: total,
          loadedCount: records.length,
        });
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
        setData(records);
        queryClient.setQueryData(["purchaseGranite"], records);
        queryClient.setQueryData(["purchaseGraniteMeta"], {
          isAllDataLoaded: isComplete,
          totalCount: tCount,
          loadedCount: lCount,
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
  }, [getCachedPurchases, queryClient, extractPurchasePageData]);

  useEffect(() => {
    startFetch(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [startFetch]);

  // Listen for query invalidations triggered by mutations (createPurchase, updatePurchase, deletePurchase)
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === "updated" &&
        event.query?.queryKey?.[0] === "purchaseGranite" &&
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
