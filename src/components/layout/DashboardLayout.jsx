import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import SyncStatusBanner from '../sync/SyncStatusBanner.jsx';
import BatchSyncBanner from '../sync/BatchSyncBanner.jsx';
import BatchCompleteModal from '../sync/BatchCompleteModal.jsx';
import ProgressPanel from '../sync/ProgressPanel.jsx';
import { useSync } from '../../context/SyncContext.jsx';

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { startBatchProgressPolling, stopBatchProgressPolling } = useSync();

  useEffect(() => {
    startBatchProgressPolling();
    return () => stopBatchProgressPolling();
  }, [startBatchProgressPolling, stopBatchProgressPolling]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <BatchSyncBanner />
          <SyncStatusBanner />
          <ProgressPanel />
          <Outlet />
          <BatchCompleteModal />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
