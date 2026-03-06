import { useSync } from '../../context/SyncContext.jsx';
import { FaSync } from 'react-icons/fa';

function SyncStatusBanner() {
  const { currentSyncId, progress, clearProgress, fetchProgress, syncApi } = useSync();

  const isRunning = currentSyncId && progress?.status === 'running';
  const showBanner = currentSyncId || (progress && progress.status !== 'running' && progress.status !== undefined);

  if (!showBanner) return null;

  const handleStop = async () => {
    if (!currentSyncId) return;
    try {
      await syncApi.stopSync(currentSyncId);
      await fetchProgress(currentSyncId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProgress = () => {
    if (currentSyncId) fetchProgress(currentSyncId);
  };

  return (
    <div className="mb-4 rounded-lg border bg-amber-50 border-amber-200/80 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <FaSync className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            {isRunning ? 'Sync in progress' : `Sync ${progress?.status || 'running'}`}
          </p>
          {currentSyncId && (
            <p className="text-xs text-amber-700 mt-0.5">ID: {currentSyncId}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isRunning && (
          <>
            <button
              type="button"
              onClick={handleViewProgress}
              className="px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
            >
              View progress
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
            >
              Stop
            </button>
          </>
        )}
        {!isRunning && progress && (
          <button
            type="button"
            onClick={clearProgress}
            className="px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

export default SyncStatusBanner;
