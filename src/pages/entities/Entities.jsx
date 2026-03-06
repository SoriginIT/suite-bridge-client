import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSync, FaDatabase, FaInfoCircle, FaPlus, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { useSync } from '../../context/SyncContext.jsx';
import { formatInIST } from '../../utils/dateUtils.js';
import AddSavedSearchModal from '../../components/modals/AddSavedSearchModal.jsx';
import SyncConfirmModal from '../../components/modals/SyncConfirmModal.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchDetailDrawer from '../../components/sync/SearchDetailDrawer.jsx';
import SyncAllConfirmModal from '../../components/sync/SyncAllConfirmModal.jsx';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function Entities() {
  const {
    loadRegistry,
    registry,
    registryLoading,
    paginationMeta,
    startPolling,
    clearProgress,
    runBatchAndTrackProgress,
    batchSyncing,
    batchProgress,
    progress,
    currentSyncId,
    syncApi,
  } = useSync();

  // Row to highlight: batch uses batchProgress current/next searchId; single sync uses progress.searchId when polling
  const currentSyncingSearchId = batchSyncing
    ? (batchProgress?.currentSearchId ?? batchProgress?.nextSearchId)
    : currentSyncId && progress?.status === 'running'
      ? (progress?.searchId ?? progress?.search_id ?? null)
      : null;

  const completedSearchIds = batchProgress?.completedSearchIds ?? [];
  const pendingSearchIds = batchProgress?.pendingSearchIds ?? [];
  const showBatchStatusIcons = batchSyncing;

  const singleSyncing = !!currentSyncId;
  const progressRunning = progress?.status === 'running';
  const anySyncInProgress = batchSyncing || singleSyncing || progressRunning;

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [syncConfirmModal, setSyncConfirmModal] = useState({ open: false, type: null, searchId: null });
  const [syncAllConfirmOpen, setSyncAllConfirmOpen] = useState(false);
  const [addSavedSearchModal, setAddSavedSearchModal] = useState({ open: false, searchId: '' });
  const [detailSearchId, setDetailSearchId] = useState(null);

  const openSyncConfirm = (type, searchId) => {
    if (!searchId) return;
    setSyncConfirmModal({ open: true, type, searchId });
  };

  const closeSyncConfirm = () => {
    setSyncConfirmModal({ open: false, type: null, searchId: null });
  };

  const confirmSync = async () => {
    const { type, searchId } = syncConfirmModal;
    if (!searchId) return;
    closeSyncConfirm();
    if (type === 'sync') {
      await handleSync(searchId);
    } else if (type === 'hardSync') {
      await handleHardSync(searchId);
    }
  };

  useEffect(() => {
    loadRegistry({ page, limit }).catch(() => toast.error('Failed to load registry'));
  }, [loadRegistry, page, limit]);

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, newPage));
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSync = async (searchId) => {
    try {
      const data = await syncApi.startSync(searchId);
      if (data?.syncId) {
        toast.success('Sync started');
        startPolling(data.syncId);
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        const existingId = data?.syncId || data?.existingSyncId;
        if (existingId) {
          startPolling(existingId);
          toast.error('A sync is already in progress');
        } else {
          toast.error('Sync already in progress');
        }
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to start sync');
      }
    }
  };

  const handleHardSync = async (searchId) => {
    try {
      const data = await syncApi.startHardSync(searchId);
      if (data?.syncId) {
        toast.success('Hard sync started');
        startPolling(data.syncId);
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        const existingId = data?.syncId || data?.existingSyncId;
        if (existingId) {
          startPolling(existingId);
          toast.error('A sync is already in progress');
        } else {
          toast.error('Sync already in progress');
        }
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to start hard sync');
      }
    }
  };

  const handleAddSavedSearch = async () => {
    const searchId = addSavedSearchModal.searchId?.trim();
    if (!searchId) {
      toast.error('Please enter a saved search ID');
      return;
    }
    setAddSavedSearchModal((m) => ({ ...m, open: false, searchId: '' }));
    await handleSync(searchId);
  };

  const handleRunBatch = async () => {
    try {
      await runBatchAndTrackProgress();
      toast.success('Batch started');
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? err.message ?? 'Failed to run batch';
      toast.error(msg);
    }
  };

  const totalCount = paginationMeta?.total ?? 0;

  const rows = Array.isArray(registry) ? registry : [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Synced searches</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddSavedSearchModal({ open: true, searchId: '' })}
            disabled={registryLoading || anySyncInProgress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add saved search
          </button>
          <button
            type="button"
            onClick={() => setSyncAllConfirmOpen(true)}
            disabled={registryLoading || anySyncInProgress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            <FaSync className={`w-4 h-4 ${anySyncInProgress ? 'animate-spin' : ''}`} />
            {anySyncInProgress ? 'Syncing…' : 'Sync all'}
          </button>
        </div>
      </div>

      <SyncAllConfirmModal
        isOpen={syncAllConfirmOpen}
        onClose={() => setSyncAllConfirmOpen(false)}
        onConfirm={handleRunBatch}
        totalCount={totalCount}
      />

      {registryLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" aria-hidden />
          <p className="text-sm text-slate-500">Loading registry…</p>
        </div>
      ) : rows.length === 0 && paginationMeta.total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No synced searches. Add searches from your backend to see them here.
        </div>
      ) : (
        <>
          <Pagination
            page={paginationMeta.page}
            totalPages={paginationMeta.totalPages}
            total={paginationMeta.total}
            limit={paginationMeta.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {showBatchStatusIcons && (
                    <th className="text-left py-3 px-2 font-medium text-slate-700 w-10" title="Batch status">Batch</th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Search</th>
                  <th className="text-left py-3 px-4 font-medium text-indigo-800 bg-indigo-50/90 border-l border-indigo-200/80">Mode</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Last sync</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Last sync records</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Last hard sync</th>
                  <th className="text-left py-3 px-4 font-medium text-emerald-800 bg-emerald-50/90 border-l border-emerald-200/80">Record count</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const searchId = row.searchId ?? row.search_id ?? row.id ?? `row-${idx}`;
                  const tableName = row.tableName ?? row.table_name ?? row.table ?? '—';
                  const syncMode = row.syncMode ?? row.sync_mode ?? '—';
                  const lastSyncAt = row.lastSyncAt ?? row.last_sync_at ?? '—';
                  const lastStatus = row.lastSyncStatus ?? row.last_sync_status ?? '—';
                  const lastRecords = row.lastSyncRecords ?? row.last_sync_records ?? '—';
                  const lastHardSyncAt = row.lastHardSyncAt ?? row.last_hard_sync_at ?? '—';
                  const recordCount = row.recordCount ?? row.record_count ?? '—';
                  const isCurrentlySyncing = currentSyncingSearchId != null && String(searchId) === String(currentSyncingSearchId);
                  const isCompleted = showBatchStatusIcons && completedSearchIds.some((id) => String(id) === String(searchId));
                  const isPending = showBatchStatusIcons && pendingSearchIds.some((id) => String(id) === String(searchId));
                  const rowClass = isCurrentlySyncing
                    ? 'border-b border-slate-100 bg-sky-50 ring-1 ring-inset ring-sky-300 animate-pulse'
                    : 'border-b border-slate-100 hover:bg-slate-50/50';
                  return (
                    <tr key={searchId} className={rowClass} title={isCurrentlySyncing ? 'Syncing now' : undefined}>
                      {showBatchStatusIcons && (
                        <td className="py-3 px-2 text-center align-middle">
                          {isCompleted && (
                            <span className="inline-flex items-center justify-center" title="Synced">
                              <FaCheckCircle className="w-5 h-5 text-emerald-600" aria-hidden />
                            </span>
                          )}
                          {isPending && !isCurrentlySyncing && (
                            <span className="inline-flex items-center justify-center" title="Waiting in queue">
                              <FaHourglassHalf className="w-5 h-5 text-slate-400" aria-hidden />
                            </span>
                          )}
                          {isCurrentlySyncing && (
                            <span className="inline-flex items-center justify-center" title="Syncing now">
                              <FaSync className="w-5 h-5 text-sky-600 animate-spin" aria-hidden />
                            </span>
                          )}
                          {!isCompleted && !isPending && !isCurrentlySyncing && <span className="text-slate-300">—</span>}
                        </td>
                      )}
                      <td className="py-3 px-4 text-slate-800 font-medium">{String(searchId)}</td>
                      <td className="py-3 px-4 text-slate-600">{String(tableName)}</td>
                      <td className="py-3 px-4 bg-indigo-50/40 border-l border-indigo-200/60">
                        <span className="inline-flex items-center font-semibold text-indigo-800 bg-white/80 border border-indigo-200/80 px-2.5 py-1 rounded-md shadow-sm min-w-[3rem] justify-center">
                          {String(syncMode)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatInIST(lastSyncAt)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            lastStatus === 'completed' || lastStatus === 'success'
                              ? 'bg-green-100 text-green-800'
                              : lastStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {String(lastStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{String(lastRecords)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatInIST(lastHardSyncAt)}</td>
                      <td className="py-3 px-4 bg-emerald-50/40 border-l border-emerald-200/60">
                        <span className="inline-flex items-center font-semibold text-emerald-800 bg-white/80 border border-emerald-200/80 px-2.5 py-1 rounded-md shadow-sm tabular-nums min-w-[2.5rem] justify-center">
                          {String(recordCount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={anySyncInProgress}
                            onClick={() => !anySyncInProgress && openSyncConfirm('sync', searchId)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 bg-slate-100/80 hover:bg-sky-100 hover:text-sky-700 border border-transparent hover:border-sky-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                            title={anySyncInProgress ? 'Sync in progress' : 'Sync'}
                          >
                            <FaSync className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={anySyncInProgress}
                            onClick={() => !anySyncInProgress && openSyncConfirm('hardSync', searchId)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 bg-slate-100/80 hover:bg-amber-100 hover:text-amber-700 border border-transparent hover:border-amber-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                            title={anySyncInProgress ? 'Sync in progress' : 'Hard sync'}
                          >
                            <FaDatabase className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailSearchId(searchId)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 bg-slate-100/80 hover:bg-indigo-100 hover:text-indigo-700 border border-transparent hover:border-indigo-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1"
                            title="Status"
                          >
                            <FaInfoCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <AddSavedSearchModal
        isOpen={addSavedSearchModal.open}
        onClose={() => setAddSavedSearchModal({ open: false, searchId: '' })}
        searchId={addSavedSearchModal.searchId}
        onSearchIdChange={(value) => setAddSavedSearchModal((m) => ({ ...m, searchId: value }))}
        onConfirm={handleAddSavedSearch}
      />

      <SyncConfirmModal
        isOpen={syncConfirmModal.open}
        onClose={closeSyncConfirm}
        type={syncConfirmModal.type}
        searchId={syncConfirmModal.searchId}
        onConfirm={confirmSync}
      />

      <SearchDetailDrawer
        searchId={detailSearchId}
        onClose={() => setDetailSearchId(null)}
        onSync={() => openSyncConfirm('sync', detailSearchId)}
        onHardSync={() => openSyncConfirm('hardSync', detailSearchId)}
        syncDisabled={anySyncInProgress}
      />
    </div>
  );
}

export default Entities;
