import { formatInIST } from '../../utils/dateUtils.js';

/** Format duration in seconds as "Xs" or "Xs (Y min Zs)" for clarity. */
export function formatDurationSeconds(seconds) {
  if (seconds == null) return null;
  const s = Math.round(Number(seconds));
  if (s < 60) return `${s}s`;
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${s}s (${min} min)` : `${s}s (${min} min ${sec}s)`;
}

/** Human-readable message for log entry */
function getLogMessage(entry) {
  const type = entry.type ?? '';
  const searchId = entry.searchId ?? entry.search_id;
  const status = entry.status;
  const duration = entry.durationSeconds ?? entry.duration_seconds;
  const mode = entry.mode ?? entry.triggerType ?? '';
  const durStr = duration != null ? formatDurationSeconds(duration) : '';

  if (type === 'batch_start') {
    return mode ? `Batch started (${mode})` : 'Batch started';
  }
  if (type === 'batch_end') {
    const synced = entry.syncedCount ?? entry.synced_count;
    const total = entry.totalCount ?? entry.total_count;
    if (synced != null && total != null) return `Batch ended · ${synced}/${total} synced ${durStr ? `in ${durStr}` : ''}`.trim();
    return durStr ? `Batch ended in ${durStr}` : 'Batch ended';
  }
  if (type === 'search_start') {
    return searchId != null ? `Search ${searchId} started` : 'Search started';
  }
  if (type === 'search_end') {
    const statusStr = status ? ` ${status}` : '';
    const d = durStr ? ` in ${durStr}` : '';
    return searchId != null ? `Search ${searchId}${statusStr}${d}`.trim() : `Search ended${statusStr}${d}`.trim();
  }
  return type || '—';
}

/** Total batch sync time in seconds: from batch_end duration or (last - first) timestamp. */
export function getBatchTotalTime(entries) {
  if (!entries?.length) return null;
  const last = entries[entries.length - 1];
  const dur = last?.durationSeconds ?? last?.duration_seconds;
  if (dur != null && last?.type === 'batch_end') return dur;
  const first = entries[0];
  const tFirst = first?.timestamp ? new Date(first.timestamp).getTime() : null;
  const tLast = last?.timestamp ? new Date(last.timestamp).getTime() : null;
  if (tFirst != null && tLast != null && tLast >= tFirst) return Math.round((tLast - tFirst) / 1000);
  return null;
}

/** Highlight duration parts (e.g. "3s", "451s") in message for quick scan. */
function MessageWithDuration({ message }) {
  if (!message || typeof message !== 'string') return message ?? '—';
  const parts = message.split(/(\d+s)/g);
  return (
    <>
      {parts.map((part, i) =>
        /\d+s/.test(part) ? (
          <span key={i} className="font-semibold text-slate-800 bg-amber-100/80 px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function LogsTable({ entries, typeLabel, currentSyncingSearchId }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">No {typeLabel.toLowerCase()} logs yet.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="text-left py-3 px-4 font-medium text-slate-700">Time (IST)</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Search ID</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Duration</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Message</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row, idx) => {
            const timestamp = row.timestamp ?? row.createdAt ?? row.created_at;
            const searchId = row.searchId ?? row.search_id;
            const status = row.status ?? row.state;
            const duration = row.durationSeconds ?? row.duration_seconds;
            const type = row.type ?? '—';
            const message = getLogMessage(row);
            const isFirst = idx === 0;
            const isLast = idx === entries.length - 1;
            const isCurrentlySyncing = currentSyncingSearchId != null && searchId != null && String(searchId) === String(currentSyncingSearchId);
            const firstCellClass = [
              'py-3 px-4 whitespace-nowrap',
              isFirst && 'font-semibold text-emerald-800 bg-emerald-50',
              isLast && !isFirst && 'font-semibold text-sky-800 bg-sky-50',
              !isFirst && !isLast && 'text-slate-600',
            ]
              .filter(Boolean)
              .join(' ');
            const rowClass = isCurrentlySyncing
              ? 'border-b border-slate-100 bg-sky-50 ring-1 ring-inset ring-sky-300 animate-pulse'
              : 'border-b border-slate-100 hover:bg-slate-50/50';
            return (
              <tr key={`${row.timestamp}-${idx}`} className={rowClass} title={isCurrentlySyncing ? 'Syncing now' : undefined}>
                <td className={firstCellClass}>
                  {timestamp ? formatInIST(timestamp) : '—'}
                </td>
                <td className="py-3 px-4 text-slate-600 capitalize">{String(type).replace(/_/g, ' ')}</td>
                <td className="py-3 px-4 text-slate-800 font-medium">{searchId != null ? String(searchId) : '—'}</td>
                <td className="py-3 px-4">
                  {status ? (
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        status === 'completed' || status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : status === 'failed' || status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : status === 'running'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {String(status)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {duration != null ? (
                    <span className="font-semibold text-slate-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                      {formatDurationSeconds(duration)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  <MessageWithDuration message={message} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LogsTable;
