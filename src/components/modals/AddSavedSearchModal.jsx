import Modal from '../Modal.jsx';

function AddSavedSearchModal({ isOpen, onClose, searchId, onSearchIdChange, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800">Add saved search</h3>
      <p className="mt-2 text-sm text-slate-600">
        Enter the saved search ID. A sync will start and the table will be created if needed. The search will appear in the list below once the sync is running or complete.
      </p>
      <div className="mt-4">
        <label htmlFor="add-saved-search-id" className="block text-sm font-medium text-slate-700 mb-1.5">
          Saved search ID
        </label>
        <input
          id="add-saved-search-id"
          type="text"
          value={searchId}
          onChange={(e) => onSearchIdChange(e.target.value)}
          placeholder="e.g. 5887"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
          onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
        />
      </div>
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
          Add and sync
        </button>
      </div>
    </Modal>
  );
}

export default AddSavedSearchModal;
