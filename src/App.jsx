import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SyncProvider } from './context/SyncContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

const toasterOptions = {
  position: 'top-right',
  duration: 3000,
  style: {
    background: '#334155',
    color: '#f8fafc',
    borderRadius: '8px',
  },
};

function App() {
  return (
    <BrowserRouter>
      <SyncProvider>
        <AppRoutes />
        <Toaster {...toasterOptions} />
      </SyncProvider>
    </BrowserRouter>
  );
}

export default App;
