import { NavLink } from 'react-router-dom';
import { FaThLarge, FaTable, FaClipboardList, FaCog, FaBars } from 'react-icons/fa';

const navItems = [
  { to: '/home', icon: FaThLarge, label: 'Dashboard' },
  { to: '/entities', icon: FaTable, label: 'Entities' },
  { to: '/logs', icon: FaClipboardList, label: 'Logs' },
  { to: '/settings', icon: FaCog, label: 'Settings' },
];

function Sidebar({ isCollapsed, onToggle }) {
  return (
    <aside
      className={`
        flex flex-col h-full bg-slate-900 text-slate-300
        border-r border-slate-700/50
        transition-[width] duration-300 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Toggle: replace FaBars with your brand icon when ready */}
      <div className="shrink-0 p-2 border-b border-slate-700/50">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-lg py-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-inset"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars className="w-6 h-6 shrink-0" />
        </button>
      </div>
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              transition-colors duration-150
              ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'}
              ${isCollapsed ? 'justify-center px-0' : ''}`
            }
            title={isCollapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
