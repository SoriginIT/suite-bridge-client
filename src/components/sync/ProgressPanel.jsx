import { useSync } from '../../context/SyncContext.jsx';
import { FaTimes } from 'react-icons/fa';
import { formatInIST } from '../../utils/dateUtils.js';

function ProgressPanel() {
  const { progress, currentSyncId, clearProgress, fetchProgress, syncApi } = useSync();

  const isRunning = currentSyncId && progress?.status === 'running';
  const show = progress != null;

  if (!show) return null;

  const handleStop = async () => {
    if (!currentSyncId) return;
    try {
      await syncApi.stopSync(currentSyncId);
      await fetchProgress(currentSyncId);
    } catch (err) {
      console.error(err);
    }
  };

  const status = progress.status || 'running';
  const percent = progress.percent ?? progress.syncPercentage ?? 0;
  const processed = progress.processed ?? 0;
  const total = progress.total ?? 0;
  const message = progress.message || '';
  const error = progress.error;
  const totalTimeTakenMinutes = progress.totalTimeTakenMinutes;
  const searchId = progress.searchId ?? progress.search_id;
  const startedAt = progress.startedAt;
  const tableName = progress.tableName ?? progress.table_name;
  const totalCount = progress.totalCount ?? progress.total_count;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-800">Sync progress</h3>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">Search ID</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{searchId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Progress</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{typeof percent === 'number' ? `${percent}%` : percent ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Started at (IST)</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{startedAt ? formatInIST(startedAt) : '—'}</dd>
            </div>
          </dl>

          <p className="mt-3 text-sm text-slate-600">
            Status: <span className="font-medium capitalize">{status}</span>
          </p>

          {isRunning && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-slate-700 transition-all duration-300"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {processed} / {total} {message ? ` · ${message}` : ''}
              </p>
            </div>
          )}

          {tableName != null && (
            <p className="mt-2 text-xs text-slate-500">Table: {tableName}</p>
          )}
          {totalCount != null && status !== 'running' && (
            <p className="mt-1 text-xs text-slate-500">Total count: {totalCount}</p>
          )}

          {status === 'completed' && totalTimeTakenMinutes != null && (
            <p className="mt-2 text-sm text-slate-600">
              Total time: {totalTimeTakenMinutes} min
            </p>
          )}
          {status === 'failed' && error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isRunning && (
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={clearProgress}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressPanel;
