import { useSync } from '../../context/SyncContext.jsx';
import { Link } from 'react-router-dom';
import Modal from '../Modal.jsx';
import { FaCheckCircle, FaList } from 'react-icons/fa';

function BatchCompleteModal() {
  const { lastBatchResult, dismissBatchCompleteModal } = useSync();

  if (!lastBatchResult) return null;

  const type = lastBatchResult.batchType ?? 'batch';
  const typeLabel = type === 'manual' ? 'Manual' : type === 'scheduled' ? 'Scheduled' : type === 'interval' ? 'Interval' : 'Batch';
  const total = lastBatchResult.totalSearches ?? 0;
  const completed = lastBatchResult.completedCount ?? 0;
  const pct = lastBatchResult.syncPercentage ?? (total > 0 ? 100 : 0);
  const startedAt = lastBatchResult.startedAt;
  const pctNum = typeof pct === 'number' ? pct : 100;

  return (
    <Modal isOpen onClose={dismissBatchCompleteModal}>
      <div className="text-center sm:text-left">
        <div className="flex justify-center sm:justify-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <FaCheckCircle className="h-8 w-8 text-emerald-600" aria-hidden />
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">
          Batch sync completed
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          All searches finished successfully.
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Searches synced</p>
              <p className="mt-0.5 text-2xl font-semibold text-slate-900">
                {completed}
                {total > 0 && <span className="text-slate-500 font-normal"> / {total}</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Progress</p>
              <p className="mt-0.5 text-2xl font-semibold text-emerald-600">
                {typeof pctNum === 'number' ? `${pctNum.toFixed(0)}%` : '100%'}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, pctNum)}%` }}
            />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium text-slate-800">{typeLabel}</dd>
          </div>
          {startedAt && (
            <div>
              <dt className="text-slate-500">Started at</dt>
              <dd className="font-medium text-slate-800">{new Date(startedAt).toLocaleString()}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismissBatchCompleteModal}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
          <Link
            to="/logs"
            onClick={dismissBatchCompleteModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700 transition-colors"
          >
            <FaList className="h-4 w-4" />
            View logs
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export default BatchCompleteModal;
