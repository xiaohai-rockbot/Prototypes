import { Search, X } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { Region } from '../../types';

const regions: Array<Region | 'ALL'> = ['ALL', 'US', 'UK', 'EU', 'AU', 'CA'];
const regionLabels: Record<Region | 'ALL', string> = {
  ALL: 'All Regions', US: 'United States', UK: 'United Kingdom',
  EU: 'European Union', AU: 'Australia', CA: 'Canada',
};

export function SearchBar() {
  const { state, dispatch } = useAdmin();

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, artist, ISRC, album, genre…"
          value={state.searchQuery}
          onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        />
        {state.searchQuery && (
          <button
            onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', query: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Listbox
        value={state.selectedRegion}
        onChange={r => dispatch({ type: 'SET_REGION_FILTER', region: r as Region | 'ALL' })}
      >
        <div className="relative">
          <Listbox.Button className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[160px]">
            <span className="flex-1 text-left">{regionLabels[state.selectedRegion]}</span>
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          </Listbox.Button>
          <Listbox.Options className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 focus:outline-none">
            {regions.map(r => (
              <Listbox.Option key={r} value={r} className={({ active }) =>
                `flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${active ? 'bg-brand-50 text-brand-700' : 'text-gray-700'}`
              }>
                {({ selected }) => (
                  <>
                    <span className="flex-1">{regionLabels[r]}</span>
                    {selected && <Check size={14} className="text-brand-500" />}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
