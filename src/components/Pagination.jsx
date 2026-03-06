import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Pagination controls. Renders above the table; passes page/limit to parent.
 * @param {number} page - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} total - Total number of items
 * @param {number} limit - Items per page
 * @param {(page: number) => void} onPageChange - Called when page changes
 * @param {(limit: number) => void} onLimitChange - Optional; called when limit changes
 */
function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-600">
          {total === 0 ? (
            'No items'
          ) : (
            <>
              Showing <span className="font-medium text-slate-800">{start}</span>–
              <span className="font-medium text-slate-800">{end}</span> of{' '}
              <span className="font-medium text-slate-800">{total}</span>
            </>
          )}
        </p>
        {typeof onLimitChange === 'function' && (
          <div className="flex items-center gap-2">
            <label htmlFor="pagination-limit" className="text-sm text-slate-600">
              Per page
            </label>
            <select
              id="pagination-limit"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-800 bg-white"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          aria-label="Previous page"
        >
          <FaChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-slate-600 px-2">
          Page <span className="font-medium text-slate-800">{page}</span> of{' '}
          <span className="font-medium text-slate-800">{totalPages || 1}</span>
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          aria-label="Next page"
        >
          Next
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
