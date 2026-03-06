import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSync, FaTable, FaClock, FaCog } from 'react-icons/fa';
import { useSync } from '../../context/SyncContext.jsx';
import { formatScheduleTimeIST } from '../../utils/dateUtils.js';
import SyncAllConfirmModal from '../../components/sync/SyncAllConfirmModal.jsx';
import AutomationScheduleModal from '../../components/modals/AutomationScheduleModal.jsx';

function Home() {
  const { loadRegistry, registryLoading, paginationMeta, runBatchAndTrackProgress, batchSyncing, currentSyncId, syncApi } = useSync();
  const anySyncInProgress = batchSyncing || !!currentSyncId;
  const [syncAllConfirmOpen, setSyncAllConfirmOpen] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [automationModalOpen, setAutomationModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ mode: 'daily', scheduleTime: '09:00', intervalHours: '2' });
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const fetchScheduleConfig = () => {
    setScheduleLoading(true);
    syncApi
      .getScheduleConfig()
      .then((data) => {
        if (data?.success !== false) {
          setScheduleConfig(data);
          setScheduleForm({
            mode: data.mode === 'interval' ? 'interval' : 'daily',
            scheduleTime: data.scheduleTime ?? '09:00',
            intervalHours: data.intervalHours != null ? String(data.intervalHours) : '2',
          });
        }
      })
      .catch(() => setScheduleConfig(null))
      .finally(() => setScheduleLoading(false));
  };

  useEffect(() => {
    loadRegistry().catch(() => {});
  }, [loadRegistry]);

  useEffect(() => {
    fetchScheduleConfig();
  }, []);

  const totalCount = paginationMeta?.total ?? 0;

  const handleSyncAll = async () => {
    try {
      await runBatchAndTrackProgress();
      toast.success('Batch started');
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? err.message ?? 'Failed to run batch';
      toast.error(msg);
    }
  };

  const handleOpenAutomationModal = () => {
    if (scheduleConfig) {
      setScheduleForm({
        mode: scheduleConfig.mode === 'interval' ? 'interval' : 'daily',
        scheduleTime: scheduleConfig.scheduleTime ?? '09:00',
        intervalHours: scheduleConfig.intervalHours != null ? String(scheduleConfig.intervalHours) : '2',
      });
    }
    setAutomationModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    setScheduleSaving(true);
    try {
      const payload = {
        mode: scheduleForm.mode,
        scheduleTime: scheduleForm.scheduleTime || '09:00',
        intervalHours: scheduleForm.mode === 'interval' ? String(scheduleForm.intervalHours) : null,
      };
      await syncApi.updateScheduleConfig(payload);
      toast.success('Schedule updated');
      fetchScheduleConfig();
      setAutomationModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? err.message ?? 'Failed to update schedule';
      toast.error(msg);
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <p className="mt-1 text-slate-600">Sync overview and quick actions.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-medium text-slate-500">Synced searches</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-800">
            {registryLoading ? '…' : totalCount}
          </p>
          <Link
            to="/entities"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <FaTable className="w-4 h-4" />
            View registry
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-medium text-slate-500">Batch sync</h3>
          <p className="mt-1 text-sm text-slate-600">Run sync for all registered searches.</p>
          <button
            type="button"
            onClick={() => setSyncAllConfirmOpen(true)}
            disabled={registryLoading || totalCount === 0 || anySyncInProgress}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSync className={`w-4 h-4 ${anySyncInProgress ? 'animate-spin' : ''}`} />
            {anySyncInProgress ? 'Syncing…' : 'Sync all'}
          </button>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenAutomationModal}
          onKeyDown={(e) => e.key === 'Enter' && handleOpenAutomationModal()}
          className="rounded-xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            Automation
            <FaCog className="w-3.5 h-3.5 ml-auto text-slate-400" />
          </h3>
          {scheduleLoading ? (
            <p className="mt-1 text-sm text-slate-500">Loading…</p>
          ) : scheduleConfig ? (
            <dl className="mt-2 space-y-1.5 text-sm">
              <div>
                <dt className="text-slate-500">Mode</dt>
                <dd className="font-medium text-slate-800 capitalize">{scheduleConfig.mode ?? '—'}</dd>
              </div>
              {scheduleConfig.mode === 'daily' && scheduleConfig.scheduleTime != null && (
                <div>
                  <dt className="text-slate-500">Schedule time</dt>
                  <dd className="font-medium text-slate-800">
                    {scheduleConfig.scheduleTime}
                    {formatScheduleTimeIST(scheduleConfig.scheduleTime) && (
                      <span className="ml-1.5 text-slate-600 font-normal">({formatScheduleTimeIST(scheduleConfig.scheduleTime)} IST)</span>
                    )}
                  </dd>
                </div>
              )}
              {scheduleConfig.mode === 'interval' && scheduleConfig.intervalHours != null && (
                <div>
                  <dt className="text-slate-500">Interval</dt>
                  <dd className="font-medium text-slate-800">{scheduleConfig.intervalHours} hour{Number(scheduleConfig.intervalHours) === 1 ? '' : 's'}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Click to configure</p>
          )}
        </div>
      </div>

      <AutomationScheduleModal
        isOpen={automationModalOpen}
        onClose={() => setAutomationModalOpen(false)}
        form={scheduleForm}
        onFormChange={setScheduleForm}
        onSave={handleSaveSchedule}
        saving={scheduleSaving}
      />

      <SyncAllConfirmModal
        isOpen={syncAllConfirmOpen}
        onClose={() => setSyncAllConfirmOpen(false)}
        onConfirm={handleSyncAll}
        totalCount={totalCount}
      />
    </div>
  );
}

export default Home;
