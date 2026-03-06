import api from './api.js';

// Base URL is expected to be e.g. http://localhost:8000/api/v1; routes are relative to that.
const SYNC_BASE = '/sync';

/**
 * Start normal sync.
 * @returns {{ syncId: string }} on 202
 * @throws axios error with response.data on 409 (sync already in progress)
 */
export async function startSync(searchId) {
  const { data } = await api.post(`${SYNC_BASE}`, { searchId });
  return data;
}

/**
 * Get sync job status by syncId.
 */
export async function getSyncStatus(syncId) {
  const { data } = await api.get(`${SYNC_BASE}/status/${syncId}`);
  return data;
}

/**
 * Get current single-sync status (for restoring after page reload).
 * @returns {{ success, status, syncId?, searchId? }} - status 'running' | 'idle' etc.; syncId when running
 */
export async function getSingleSyncStatus() {
  const { data } = await api.get(`${SYNC_BASE}/single-sync-status`);
  return data;
}

/**
 * Stop a running sync.
 */
export async function stopSync(syncId) {
  await api.post(`${SYNC_BASE}/stop/${syncId}`);
}

/**
 * Start hard sync.
 * @returns {{ syncId: string }} on 202
 * @throws on 409
 */
export async function startHardSync(searchId) {
  const { data } = await api.post(`${SYNC_BASE}/hard`, { searchId });
  return data;
}

/**
 * Get registry (list of synced searches) with optional pagination.
 * @param {{ page?: number, limit?: number }} params - page (1-based) and limit per page
 * @returns backend response (array or { searches/data/registry, total?, totalPages?, page?, limit? })
 */
export async function getRegistry(params = {}) {
  const { page, limit } = params;
  const query = new URLSearchParams();
  if (page != null) query.set('page', String(page));
  if (limit != null) query.set('limit', String(limit));
  const queryString = query.toString();
  const url = queryString ? `${SYNC_BASE}/registry?${queryString}` : `${SYNC_BASE}/registry`;
  const { data } = await api.get(url);
  return data;
}

/**
 * Get status for one search by searchId.
 */
export async function getStatusBySearch(searchId) {
  const { data } = await api.get(`${SYNC_BASE}/status/by-search/${encodeURIComponent(searchId)}`);
  return data;
}

/**
 * Drop a search (table + config).
 */
export async function dropBySearch(searchId) {
  await api.delete(`${SYNC_BASE}/by-search/${encodeURIComponent(searchId)}`);
}

/**
 * Run batch (sync all).
 * @returns 202
 */
export async function runBatch() {
  await api.post(`${SYNC_BASE}/run-batch`);
}

/**
 * Get batch sync logs.
 * @returns backend response (array of log entries or { logs: [...] })
 */
export async function getBatchLogs() {
  const { data } = await api.get(`${SYNC_BASE}/batch-logs`);
  return data;
}

/**
 * Get batch sync progress (running or idle).
 * Backend must return syncId as the actual ongoing sync job ID (e.g. "mmd79d49iliuatt7"), not the searchId.
 * @returns {{ success, batchType, status, startedAt, totalSearches, completedCount, currentSearchId, nextSearchId, syncPercentage, syncId?, completedSearchIds?, pendingSearchIds? }}
 */
export async function getBatchProgress() {
  const { data } = await api.get(`${SYNC_BASE}/batch-progress`);
  return data;
}

/**
 * Get automation config (mode, schedule time, interval).
 * @returns {{ success, mode, scheduleTime, intervalHours }}
 */
export async function getAutomationConfig() {
  const { data } = await api.get(`${SYNC_BASE}/automation-config`);
  return data;
}

/**
 * Get schedule config (mode: 'daily' | 'interval', scheduleTime, intervalHours).
 * @returns {{ success, mode, scheduleTime, intervalHours }}
 */
export async function getScheduleConfig() {
  const { data } = await api.get(`${SYNC_BASE}/schedule-config`);
  return data;
}

/**
 * Update schedule config (PATCH).
 * @param {{ mode: 'daily'|'interval', scheduleTime?: string, intervalHours?: string|number }} payload
 */
export async function updateScheduleConfig(payload) {
  const { data } = await api.patch(`${SYNC_BASE}/schedule-config`, payload);
  return data;
}
