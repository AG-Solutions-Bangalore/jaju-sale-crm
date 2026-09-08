import axios from "axios";

/**
 * Executes a 2-phase progressive pagination fetch:
 * Phase 1: Immediate priority fetch of pages 1, 2, 3 (paints initial UI in ~100ms)
 * Phase 2: Controlled parallel background fetch of pages 4..lastPage (concurrency limit)
 *
 * @param {Object} options
 * @param {(page: number, signal?: AbortSignal) => Promise<any>} options.fetchPage
 * @param {(response: any) => { records: any[], lastPage: number, total: number, currentPage?: number }} options.extractPageData
 * @param {(info: { records: any[], lastPage: number, total: number, pagination: any }) => void} options.onInitialReady
 * @param {(info: { records: any[], loadedCount: number, totalCount: number, isComplete: boolean }) => void} options.onProgress
 * @param {(error: any) => void} options.onError
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.concurrency=5]
 */
export async function runProgressivePaginationFetch({
  fetchPage,
  extractPageData,
  onInitialReady,
  onProgress,
  onError,
  signal,
  concurrency = 5,
}) {
  const pageMap = new Map(); // pageNum -> Array of records
  let lastPage = 1;
  let totalRecords = 0;
  let hasSignaledInitial = false;

  // Flatten pages in natural ascending order (1, 2, 3... lastPage) and deduplicate by `id`
  const getMergedRecords = () => {
    const sortedPages = Array.from(pageMap.entries()).sort(([a], [b]) => a - b);
    const seen = new Set();
    const result = [];

    for (const [, items] of sortedPages) {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.id != null) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              result.push(item);
            }
          } else if (item) {
            result.push(item);
          }
        }
      }
    }
    return result;
  };

  const notifyInitialIfReady = () => {
    if (!hasSignaledInitial && pageMap.has(1)) {
      hasSignaledInitial = true;
      const records = getMergedRecords();
      onInitialReady({
        records,
        lastPage,
        total: totalRecords || records.length,
        pagination: {
          current_page: 1,
          last_page: lastPage,
          per_page: records.length,
          total: totalRecords || records.length,
        },
      });
    }
  };

  // Helper to fetch a single page with retries
  const fetchSinglePage = async (pageNum, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (signal?.aborted) return null;
      try {
        const res = await fetchPage(pageNum, signal);
        const data = extractPageData(res);
        return data;
      } catch (err) {
        if (axios.isCancel(err) || signal?.aborted) {
          return null;
        }
        if (attempt === retries) {
          console.warn(`[paginationFetcher] Failed page ${pageNum} after ${retries + 1} attempts:`, err?.message || err);
          return null;
        }
        // Brief linear backoff before retry
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
    return null;
  };

  try {
    // --- PHASE 1: Priority Initial Fetch ---
    // Start page 1 immediately
    const p1Promise = fetchSinglePage(1, 1);
    // Speculatively start page 2 and page 3 in parallel
    const p2Promise = fetchSinglePage(2, 0);
    const p3Promise = fetchSinglePage(3, 0);

    const p1Data = await p1Promise;
    if (signal?.aborted) return;

    if (!p1Data || !Array.isArray(p1Data.records)) {
      throw new Error("Failed to load primary page data");
    }

    pageMap.set(1, p1Data.records);
    lastPage = p1Data.lastPage || 1;
    totalRecords = p1Data.total || p1Data.records.length;

    // Immediately trigger initial paint with Page 1 so UI renders without waiting for subsequent pages
    notifyInitialIfReady();

    // If only 1 page exists on server, complete immediately
    if (lastPage <= 1) {
      onProgress({
        records: getMergedRecords(),
        loadedCount: pageMap.get(1).length,
        totalCount: totalRecords,
        isComplete: true,
      });
      return;
    }

    // Now resolve pages 2 & 3 (which were initiated simultaneously with page 1)
    const missingPriorityPages = [];

    if (lastPage >= 2) {
      const p2Data = await p2Promise;
      if (p2Data && Array.isArray(p2Data.records)) {
        pageMap.set(2, p2Data.records);
      } else if (!signal?.aborted) {
        missingPriorityPages.push(2);
      }
    }

    if (lastPage >= 3) {
      const p3Data = await p3Promise;
      if (p3Data && Array.isArray(p3Data.records)) {
        pageMap.set(3, p3Data.records);
      } else if (!signal?.aborted) {
        missingPriorityPages.push(3);
      }
    }

    if (signal?.aborted) return;

    const currentRecords = getMergedRecords();
    const isAlreadyFinished = lastPage <= 3 && missingPriorityPages.length === 0;

    onProgress({
      records: currentRecords,
      loadedCount: currentRecords.length,
      totalCount: totalRecords,
      isComplete: isAlreadyFinished,
    });

    if (isAlreadyFinished) return;

    // --- PHASE 2: Background Controlled Concurrency ---
    // Build queue of pages: any priority page that failed + pages 4..lastPage
    const queue = [...missingPriorityPages];
    for (let p = 4; p <= lastPage; p++) {
      queue.push(p);
    }

    const workerCount = Math.min(concurrency, queue.length);

    const worker = async () => {
      while (queue.length > 0) {
        if (signal?.aborted) return;
        const pageNum = queue.shift();
        if (!pageNum) continue;

        const pageData = await fetchSinglePage(pageNum, 2);
        if (signal?.aborted) return;

        if (pageData && Array.isArray(pageData.records)) {
          pageMap.set(pageNum, pageData.records);
        }

        const updatedRecords = getMergedRecords();
        const isDone = queue.length === 0;

        onProgress({
          records: updatedRecords,
          loadedCount: updatedRecords.length,
          totalCount: totalRecords,
          isComplete: isDone,
        });
      }
    };

    // Run parallel workers with concurrency ceiling
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    if (signal?.aborted) return;

    // Final completion callback
    const finalRecords = getMergedRecords();
    onProgress({
      records: finalRecords,
      loadedCount: finalRecords.length,
      totalCount: totalRecords,
      isComplete: true,
    });
  } catch (err) {
    if (axios.isCancel(err) || signal?.aborted) return;
    if (!hasSignaledInitial) {
      onError(err);
    } else {
      console.warn("[paginationFetcher] Error in background fetch phase:", err?.message || err);
    }
  }
}
