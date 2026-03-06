const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date/time value in IST (Indian Standard Time).
 * @param {string|number|Date|null|undefined} value - ISO date string, timestamp (ms), or Date. Falsy returns '—'.
 * @returns {string} Formatted string in IST (e.g. "23 Feb 2025, 3:45 pm") or '—' if invalid/missing.
 */
export function formatInIST(value) {
  if (value == null || value === '') return '—';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '—';
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  });
}

/**
 * Format a time string "HH:mm" (24h, already in IST) as 12-hour IST display.
 * @param {string} timeStr - Time in "HH:mm" or "H:mm" (24h), stored in IST.
 * @returns {string} Time in IST (e.g. "5:11 pm") or null if invalid.
 */
export function formatScheduleTimeIST(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [h, m] = timeStr.trim().split(':').map(Number);
  if (Number.isNaN(h) || h < 0 || h > 23) return null;
  const min = Number.isNaN(m) ? 0 : Math.min(59, Math.max(0, m));
  // Treat h:mm as IST; UTC = IST - 5:30
  const utcMs = Date.UTC(2000, 0, 1, h, min, 0) - (5 * 60 + 30) * 60 * 1000;
  const date = new Date(utcMs);
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    timeStyle: 'short',
    hour12: true,
  });
}
