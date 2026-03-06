import Modal from '../Modal.jsx';

function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800">Logout</h3>
      <p className="mt-2 text-slate-600">Are you sure you want to logout?</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          No
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Yes
        </button>
      </div>
    </Modal>
  );
}

export default LogoutConfirmModal;
