import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as syncApi from '../services/syncApi.js';

const SyncContext = createContext(null);

const POLL_INTERVAL_MS = 2000;
const BATCH_PROGRESS_POLL_MS = 3000;

export function SyncProvider({ children }) {
  const [currentSyncId, setCurrentSyncId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [registry, setRegistry] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [batchProgress, setBatchProgress] = useState(null);
  const [lastBatchResult, setLastBatchResult] = useState(null);
  const pollRef = useRef(null);
  const batchProgressPollRef = useRef(null);
  const prevBatchProgressRef = useRef(null);
  const batchCurrentSyncIdRef = useRef(null);
  const lastRegistryOptsRef = useRef({ page: 1, limit: 10 });
  const refreshRegistryAfterSyncCompleteRef = useRef(null);

  const batchSyncing = batchProgress?.status === 'running';

  useEffect(() => {
    if (batchProgress?.status === 'idle' && prevBatchProgressRef.current?.status === 'running') {
      setLastBatchResult(prevBatchProgressRef.current);
    }
    prevBatchProgressRef.current = batchProgress;
  }, [batchProgress]);

  const dismissBatchCompleteModal = useCallback(() => setLastBatchResult(null), []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchBatchProgress = useCallback(async () => {
    try {
      const data = await syncApi.getBatchProgress();
      if (data?.success !== false) setBatchProgress(data);
    } catch {
      setBatchProgress((p) => (p ? { ...p, status: 'idle' } : null));
    }
  }, []);

  const fetchProgress = useCallback(async (syncId) => {
    try {
      const res = await syncApi.getSyncStatus(syncId);
      setProgress(res);
      if (res.status && res.status !== 'running') {
        setCurrentSyncId(null);
        stopPolling();
        if (refreshRegistryAfterSyncCompleteRef.current) {
          refreshRegistryAfterSyncCompleteRef.current();
        }
      }
    } catch (err) {
      setProgress((p) => ({ ...p, status: 'failed', error: err.message || 'Failed to fetch status' }));
      setCurrentSyncId(null);
      stopPolling();
      if (refreshRegistryAfterSyncCompleteRef.current) {
        refreshRegistryAfterSyncCompleteRef.current();
      }
    }
  }, [stopPolling]);

  const startPolling = useCallback((syncId) => {
    stopPolling();
    setCurrentSyncId(syncId);
    fetchProgress(syncId);
    pollRef.current = setInterval(() => fetchProgress(syncId), POLL_INTERVAL_MS);
  }, [fetchProgress, stopPolling]);

  const restoreSingleSyncIfRunning = useCallback(async () => {
    try {
      const data = await syncApi.getSingleSyncStatus();
      if (data?.success !== false && data?.status === 'running' && data?.syncId) {
        startPolling(data.syncId);
      }
    } catch {
      // ignore; no single sync to restore
    }
  }, [startPolling]);

  // When batch progress returns a syncId, show the single-sync progress panel by polling that sync
  useEffect(() => {
    if (batchProgress?.status === 'running' && batchProgress?.syncId) {
      if (batchCurrentSyncIdRef.current !== batchProgress.syncId) {
        batchCurrentSyncIdRef.current = batchProgress.syncId;
        startPolling(batchProgress.syncId);
      }
      return () => {};
    }
    if (batchProgress?.status !== 'running' && batchCurrentSyncIdRef.current != null) {
      batchCurrentSyncIdRef.current = null;
      stopPolling();
      setCurrentSyncId(null);
      setProgress(null);
    }
  }, [batchProgress?.status, batchProgress?.syncId, startPolling, stopPolling]);

  const startBatchProgressPolling = useCallback(() => {
    if (batchProgressPollRef.current) return;
    fetchBatchProgress();
    batchProgressPollRef.current = setInterval(fetchBatchProgress, BATCH_PROGRESS_POLL_MS);
    restoreSingleSyncIfRunning();
  }, [fetchBatchProgress, restoreSingleSyncIfRunning]);

  const stopBatchProgressPolling = useCallback(() => {
    if (batchProgressPollRef.current) {
      clearInterval(batchProgressPollRef.current);
      batchProgressPollRef.current = null;
    }
  }, []);

  const runBatchAndTrackProgress = useCallback(async () => {
    await syncApi.runBatch();
    fetchBatchProgress();
  }, [fetchBatchProgress]);

  const clearProgress = useCallback(() => {
    stopPolling();
    setCurrentSyncId(null);
    setProgress(null);
  }, [stopPolling]);

  const loadRegistry = useCallback(async (opts = {}) => {
    const { page = 1, limit = 10 } = opts;
    lastRegistryOptsRef.current = { page, limit };
    setRegistryLoading(true);
    try {
      const data = await syncApi.getRegistry({ page, limit });
      const list = Array.isArray(data) ? data : (data?.searches ?? data?.registry ?? data?.data ?? []);
      setRegistry(list);
      const total = data?.total ?? data?.totalCount ?? list.length;
      const totalPages = data?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1);
      setPaginationMeta({ page, limit, total, totalPages });
    } catch (err) {
      setRegistry([]);
      setPaginationMeta((p) => ({ ...p, total: 0, totalPages: 0 }));
      throw err;
    } finally {
      setRegistryLoading(false);
    }
  }, []);

  const refreshRegistryAfterSyncComplete = useCallback(() => {
    loadRegistry(lastRegistryOptsRef.current).catch(() => {});
  }, [loadRegistry]);

  refreshRegistryAfterSyncCompleteRef.current = refreshRegistryAfterSyncComplete;

  useEffect(() => {
    return () => {
      if (batchProgressPollRef.current) clearInterval(batchProgressPollRef.current);
    };
  }, []);

  const value = {
    currentSyncId,
    progress,
    setCurrentSyncId,
    startPolling,
    stopPolling,
    clearProgress,
    registry,
    registryLoading,
    paginationMeta,
    loadRegistry,
    fetchProgress,
    syncApi,
    batchSyncing,
    batchProgress,
    lastBatchResult,
    dismissBatchCompleteModal,
    runBatchAndTrackProgress,
    startBatchProgressPolling,
    stopBatchProgressPolling,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
