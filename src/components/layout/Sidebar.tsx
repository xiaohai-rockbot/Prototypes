import { Music2, Upload, LayoutDashboard } from 'lucide-react';
import type { AdminTab } from '../../types';
import { useAdmin } from '../../context/AdminContext';

const navItems: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
  { tab: 'search', label: 'Search & Match', icon: <Music2 size={18} /> },
  { tab: 'manual-import', label: 'Manual Import', icon: <Upload size={18} /> },
];

export function Sidebar() {
  const { state, dispatch } = useAdmin();

  return (
    <aside className="w-56 flex-shrink-0 bg-navy-900 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-navy-700">
        <div className="bg-brand-500 rounded-lg p-1.5">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <span className="text-white font-semibold text-sm leading-tight">
          7Digital<br />
          <span className="text-navy-600 font-normal text-xs">Massive Music Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = state.activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => dispatch({ type: 'SET_TAB', tab: item.tab })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:bg-navy-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
            RC
          </div>
          <div>
            <p className="text-white text-xs font-medium">Curation Team</p>
            <p className="text-gray-500 text-xs">Admin v2</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
