import { FaSync } from 'react-icons/fa';
import Modal from '../Modal.jsx';

function SyncAllConfirmModal({ isOpen, onClose, onConfirm, totalCount }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800">Sync all searches?</h3>
      <p className="mt-2 text-sm text-slate-600">
        {totalCount != null && totalCount > 0
          ? `This will run a batch sync for all ${totalCount} registered search${totalCount === 1 ? '' : 'es'}. This may take a while.`
          : 'This will run a batch sync for all registered searches. This may take a while.'}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700 transition-colors"
        >
          <FaSync className="h-4 w-4" />
          Sync all
        </button>
      </div>
    </Modal>
  );
}

export default SyncAllConfirmModal;
