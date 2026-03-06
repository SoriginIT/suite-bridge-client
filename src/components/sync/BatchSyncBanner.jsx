import { Link } from 'react-router-dom';
import { useSync } from '../../context/SyncContext.jsx';
import { FaSync } from 'react-icons/fa';

function BatchSyncBanner() {
  const { batchProgress } = useSync();
  const running = batchProgress?.status === 'running';

  if (!running) return null;

  const type = batchProgress?.batchType ?? 'batch';
  const total = batchProgress?.totalSearches ?? 0;
  const completed = batchProgress?.completedCount ?? 0;
  const pct = batchProgress?.syncPercentage ?? 0;
  const current = batchProgress?.currentSearchId ?? batchProgress?.nextSearchId;

  return (
    <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <FaSync className="w-5 h-5 text-sky-600 shrink-0 animate-spin" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-sky-900">
            {type === 'manual' ? 'Manual' : type === 'scheduled' ? 'Scheduled' : type === 'interval' ? 'Interval' : 'Batch'} sync in progress
          </p>
          <p className="text-xs text-sky-700 mt-0.5">
            {total > 0 ? (
              <> {completed}/{total} searches · {typeof pct === 'number' ? `${pct.toFixed(1)}%` : pct} {current ? `· current: ${current}` : ''}</>
            ) : (
              'Syncing all registered searches.'
            )}{' '}
            View logs for details.
          </p>
        </div>
      </div>
      <Link
        to="/logs"
        className="shrink-0 px-3 py-1.5 text-sm font-medium text-sky-800 bg-sky-100 rounded-md hover:bg-sky-200 transition-colors"
      >
        View logs
      </Link>
    </div>
  );
}

export default BatchSyncBanner;
