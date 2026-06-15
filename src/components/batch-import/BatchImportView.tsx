import { useState } from 'react';
import { FileUp, Package } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { SearchBar } from '../search/SearchBar';
import { CatalogTable } from '../search/CatalogTable';
import { JobQueuePanel } from './JobQueuePanel';
import { BatchImportConfirmModal } from './BatchImportConfirmModal';
import { CSVUploadModal } from './CSVUploadModal';
import { mockTracks } from '../../data/mockTracks';

export function BatchImportView() {
  const { state, filteredTracks } = useAdmin();
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const selectedTracks = mockTracks.filter(t => state.selectedTrackIds.includes(t.id));
  const selCount = selectedTracks.length;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Batch Import</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Select tracks and import them into the Rockbot catalog
              </p>
            </div>
            <button
              onClick={() => setCsvModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium px-3 py-2 border border-gray-200 rounded-xl hover:border-brand-400 hover:text-brand-600 text-gray-600 transition-colors"
            >
              <FileUp size={15} />
              Bulk ISRC Match via CSV
            </button>
          </div>
          <SearchBar />
        </div>

        {/* Result count */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>{filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''} · {selCount} selected</span>
          {state.sort.key && (
            <span className="text-brand-500">Sorted by {state.sort.key} ({state.sort.direction})</span>
          )}
        </div>

        <div className="flex-1 overflow-auto pb-20">
          <CatalogTable tracks={filteredTracks} />
        </div>
      </div>

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
      <CSVUploadModal open={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
    </div>
  );
}
