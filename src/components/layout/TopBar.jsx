import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import LogoutConfirmModal from '../modals/LogoutConfirmModal.jsx';

function TopBar() {
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-white border-b border-slate-200/80 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
          Suite Bridge
        </h1>
        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          aria-label="Profile and logout"
          title="Profile"
        >
          <FaUser className="w-6 h-6" />
        </button>
      </header>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

export default TopBar;
