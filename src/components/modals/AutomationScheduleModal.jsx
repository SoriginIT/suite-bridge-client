import Modal from '../Modal.jsx';

function AutomationScheduleModal({ isOpen, onClose, form, onFormChange, onSave, saving }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800">Automation schedule</h3>
      <p className="mt-1 text-sm text-slate-600">Choose when sync runs: daily at a set time or at a fixed interval.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mode</label>
          <select
            value={form.mode}
            onChange={(e) => onFormChange((f) => ({ ...f, mode: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            <option value="daily">Daily (at set time)</option>
            <option value="interval">Interval (every N hours)</option>
          </select>
        </div>
        {form.mode === 'daily' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule time (24h)</label>
            <input
              type="time"
              value={form.scheduleTime}
              onChange={(e) => onFormChange((f) => ({ ...f, scheduleTime: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
        )}
        {form.mode === 'interval' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Interval (hours)</label>
            <input
              type="number"
              min={1}
              max={168}
              value={form.intervalHours}
              onChange={(e) => onFormChange((f) => ({ ...f, intervalHours: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

export default AutomationScheduleModal;
