import { Sidebar } from './Sidebar';
import { SearchView } from '../search/SearchView';
import { ManualImportView } from '../manual-import/ManualImportView';
import { useAdmin } from '../../context/AdminContext';

export function AppShell() {
  const { state } = useAdmin();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {state.activeTab === 'search' && <SearchView />}
        {state.activeTab === 'manual-import' && <ManualImportView />}
      </main>
    </div>
  );
}
