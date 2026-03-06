import Modal from '../Modal.jsx';

function SyncConfirmModal({ isOpen, onClose, type, searchId, onConfirm }) {
  const isHardSync = type === 'hardSync';
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800">
        {isHardSync ? 'Start hard sync?' : 'Start sync?'}
      </h3>
      <p className="mt-2 text-slate-600">
        {isHardSync
          ? `Are you sure you want to run a hard sync for search "${searchId}"? This will refresh all data for this search.`
          : `Are you sure you want to start a sync for search "${searchId}"?`}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export default SyncConfirmModal;
