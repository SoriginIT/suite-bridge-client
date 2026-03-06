import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login.jsx';
import Home from '../pages/home/Home.jsx';
import Entities from '../pages/entities/Entities.jsx';
import Logs from '../pages/logs/Logs.jsx';
import Settings from '../pages/settings/Settings.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="entities" element={<Entities />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default AppRoutes;
