import { useState } from 'react';
import { Globe, Package } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { SearchBar } from './SearchBar';
import { CatalogTable } from './CatalogTable';
import { JobQueuePanel } from '../batch-import/JobQueuePanel';
import { BatchImportConfirmModal } from '../batch-import/BatchImportConfirmModal';
import { mockTracks } from '../../data/mockTracks';

export function SearchView() {
  const { filteredTracks, state } = useAdmin();
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const selectedTracks = mockTracks.filter(t => state.selectedTrackIds.includes(t.id));
  const selCount = selectedTracks.length;

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">7Digital / Massive Music</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Search catalog · match to Rockbot songs · import content
              </p>
            </div>
            {state.selectedRegion !== 'ALL' && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full border border-brand-200">
                <Globe size={11} />
                {state.selectedRegion}
              </span>
            )}
          </div>
          <SearchBar />
          <p className="text-xs text-gray-400 mt-2">
            *Click a 7D Track ID, Release ID, or ISRC to copy. Click column headers to sort.
            Use <strong>Find in Rockbot</strong> to link a 7Digital track to an existing catalog entry.
          </p>
        </div>

        {/* Results count + sort indicator */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
            {selCount > 0 && (
              <span className="ml-2 text-brand-600 font-medium">· {selCount} selected</span>
            )}
          </span>
          {state.sort.key && (
            <span className="text-xs text-brand-500">
              Sorted by {state.sort.key} ({state.sort.direction})
            </span>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto pb-20">
          <CatalogTable tracks={filteredTracks} />
        </div>
      </div>

      {/* Import Queue side panel */}
      <JobQueuePanel />

      {/* Sticky batch action bar */}
      {selCount > 0 && (
        <div className="fixed bottom-0 left-56 right-72 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {selCount}
            </div>
            <span className="text-sm font-medium text-gray-800">
              {selCount} track{selCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600"
          >
            <Package size={15} />
            Import Selected
          </button>
        </div>
      )}

      <BatchImportConfirmModal
        open={batchModalOpen}
        tracks={selectedTracks}
        onClose={() => setBatchModalOpen(false)}
      />
    </div>
  );
}
