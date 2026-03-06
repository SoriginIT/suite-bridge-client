import { useEffect, useState } from 'react';
import { FaTimes, FaSync, FaDatabase } from 'react-icons/fa';
import { useSync } from '../../context/SyncContext.jsx';
import { formatInIST } from '../../utils/dateUtils.js';

function SearchDetailDrawer({ searchId, onClose, onSync, onHardSync, syncDisabled = false }) {
  const { syncApi } = useSync();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchId) {
      setData(null);
      return;
    }
    setLoading(true);
    syncApi
      .getStatusBySearch(searchId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [searchId, syncApi]);

  if (searchId == null) return null;

  const tableName = data?.tableName ?? data?.table_name ?? '—';
  const syncMode = data?.syncMode ?? data?.sync_mode ?? '—';
  const lastSyncAt = data?.lastSyncAt ?? data?.last_sync_at ?? '—';
  const lastSyncStatus = data?.lastSyncStatus ?? data?.last_sync_status ?? '—';
  const lastSyncRecords = data?.lastSyncRecords ?? data?.last_sync_records ?? '—';
  const lastHardSyncAt = data?.lastHardSyncAt ?? data?.last_hard_sync_at ?? '—';
  const recordCount = data?.recordCount ?? data?.record_count ?? '—';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Search status</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 font-medium">Search ID</dt>
                <dd className="mt-0.5 text-slate-800 font-mono">{searchId}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Table</dt>
                <dd className="mt-0.5 text-slate-800">{String(tableName)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Sync mode</dt>
                <dd className="mt-0.5 text-slate-800">{String(syncMode)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Last sync</dt>
                <dd className="mt-0.5 text-slate-800">{formatInIST(lastSyncAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Last sync status</dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      lastSyncStatus === 'completed' || lastSyncStatus === 'success'
                        ? 'bg-green-100 text-green-800'
                        : lastSyncStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {String(lastSyncStatus)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Last sync records</dt>
                <dd className="mt-0.5 text-slate-800">{String(lastSyncRecords)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Last hard sync</dt>
                <dd className="mt-0.5 text-slate-800">{formatInIST(lastHardSyncAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Record count</dt>
                <dd className="mt-0.5 text-slate-800">{String(recordCount)}</dd>
              </div>
            </dl>
          )}
        </div>
        {!loading && (
          <div className="p-4 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={onSync}
              disabled={syncDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
            >
              <FaSync className="w-4 h-4" />
              Sync
            </button>
            <button
              type="button"
              onClick={onHardSync}
              disabled={syncDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-50"
            >
              <FaDatabase className="w-4 h-4" />
              Hard sync
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default SearchDetailDrawer;
