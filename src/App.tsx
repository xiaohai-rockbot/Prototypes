import { AdminProvider } from './context/AdminContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <AdminProvider>
      <AppShell />
    </AdminProvider>
  );
}

export default App;
