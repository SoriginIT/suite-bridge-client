import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaSync } from 'react-icons/fa';
import { getBatchLogs } from '../../services/syncApi.js';
import { useSync } from '../../context/SyncContext.jsx';
import LogsTable, { formatDurationSeconds, getBatchTotalTime } from '../../components/logs/LogsTable.jsx';

/** Get entries for one log type (manual/scheduled/interval), sorted by timestamp asc so batch_start is first, batch_end last. */
function getEntriesByType(data, typeKey) {
  const logsObj = data?.logs ?? data?.batchLogs ?? data;
  const block = logsObj?.[typeKey];
  const entries = Array.isArray(block?.entries) ? block.entries : [];
  const sorted = [...entries].sort((a, b) => {
    const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tA - tB;
  });
  return sorted;
}

/** Parse API into { manual, scheduled, interval } each an array of entries (chronological: batch start first, batch end last). */
function parseLogsByType(data) {
  return {
    manual: getEntriesByType(data, 'manual'),
    scheduled: getEntriesByType(data, 'scheduled'),
    interval: getEntriesByType(data, 'interval'),
  };
}

const LOGS_POLL_INTERVAL_MS = 4000;

function Logs() {
  const { batchProgress } = useSync();
  const currentSyncingSearchId = batchProgress?.status === 'running'
    ? (batchProgress?.currentSearchId ?? batchProgress?.nextSearchId)
    : null;
  const syncingBatchType = batchProgress?.status === 'running' ? batchProgress?.batchType : null;
  const [logsByType, setLogsByType] = useState({ manual: [], scheduled: [], interval: [] });
  const [loading, setLoading] = useState(true);
  const logsPollRef = useRef(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getBatchLogs();
      setLogsByType(parseLogsByType(data));
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.message || err.message || 'Failed to load logs');
      setLogsByType({ manual: [], scheduled: [], interval: [] });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (batchProgress?.status !== 'running') return;
    logsPollRef.current = setInterval(() => fetchLogs(true), LOGS_POLL_INTERVAL_MS);
    return () => {
      if (logsPollRef.current) clearInterval(logsPollRef.current);
    };
  }, [batchProgress?.status]);

  const hasAny = logsByType.manual.length > 0 || logsByType.scheduled.length > 0 || logsByType.interval.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Batch logs</h2>
          <p className="mt-1 text-slate-600">Logs by type: Manual, Scheduled, and Interval. Chronological order (batch start at top, batch end at bottom). Duration highlighted.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(false)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {batchProgress?.status === 'running' && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 flex items-center gap-3">
          <FaSync className="w-5 h-5 text-sky-600 shrink-0 animate-spin" />
          <p className="text-sm font-medium text-sky-900">
            Sync in progress. Logs below auto-refresh every few seconds.
          </p>
        </div>
      )}

      {loading && !hasAny ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading logs…
        </div>
      ) : !hasAny ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <p className="text-sm">No batch logs yet.</p>
          <p className="mt-1 text-xs">Run a batch sync from Dashboard or Entities to see logs here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-200 flex flex-wrap items-baseline gap-x-4 gap-y-1 ${syncingBatchType === 'manual' ? 'bg-sky-50/90' : 'bg-slate-50/80'}`}>
              <h3 className={`text-base font-semibold ${syncingBatchType === 'manual' ? 'text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded' : 'text-slate-800'}`}>Manual</h3>
              {getBatchTotalTime(logsByType.manual) != null && (
                <span className="text-sm text-slate-600">
                  Total time taken:{' '}
                  <span className="font-semibold text-slate-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {formatDurationSeconds(getBatchTotalTime(logsByType.manual))}
                  </span>
                </span>
              )}
            </div>
            <div className="px-4">
              <LogsTable entries={logsByType.manual} typeLabel="Manual" currentSyncingSearchId={currentSyncingSearchId} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-200 flex flex-wrap items-baseline gap-x-4 gap-y-1 ${syncingBatchType === 'scheduled' ? 'bg-sky-50/90' : 'bg-slate-50/80'}`}>
              <h3 className={`text-base font-semibold ${syncingBatchType === 'scheduled' ? 'text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded' : 'text-slate-800'}`}>Scheduled</h3>
              {getBatchTotalTime(logsByType.scheduled) != null && (
                <span className="text-sm text-slate-600">
                  Total time taken:{' '}
                  <span className="font-semibold text-slate-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {formatDurationSeconds(getBatchTotalTime(logsByType.scheduled))}
                  </span>
                </span>
              )}
            </div>
            <div className="px-4">
              <LogsTable entries={logsByType.scheduled} typeLabel="Scheduled" currentSyncingSearchId={currentSyncingSearchId} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-200 flex flex-wrap items-baseline gap-x-4 gap-y-1 ${syncingBatchType === 'interval' ? 'bg-sky-50/90' : 'bg-slate-50/80'}`}>
              <h3 className={`text-base font-semibold ${syncingBatchType === 'interval' ? 'text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded' : 'text-slate-800'}`}>Interval</h3>
              {getBatchTotalTime(logsByType.interval) != null && (
                <span className="text-sm text-slate-600">
                  Total time taken:{' '}
                  <span className="font-semibold text-slate-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {formatDurationSeconds(getBatchTotalTime(logsByType.interval))}
                  </span>
                </span>
              )}
            </div>
            <div className="px-4">
              <LogsTable entries={logsByType.interval} typeLabel="Interval" currentSyncingSearchId={currentSyncingSearchId} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Logs;
