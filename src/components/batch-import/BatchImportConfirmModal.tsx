import { Dialog } from '@headlessui/react';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import type { SevenDigitalTrack } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { useImportTrack } from '../../hooks/useImportTrack';

interface Props {
  open: boolean;
  tracks: SevenDigitalTrack[];
  onClose: () => void;
}

export function BatchImportConfirmModal({ open, tracks, onClose }: Props) {
  const { overlapResults } = useAdmin();
  const { importTracks } = useImportTrack();

  const inCatalogCount = tracks.filter(t => overlapResults[t.id]?.inCatalog && overlapResults[t.id]?.linkedBy === 'isrc').length;
  const newCount = tracks.length - inCatalogCount;

  function handleConfirm() {
    importTracks(tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist })), '', []);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
          <Dialog.Title className="text-base font-semibold text-gray-900 mb-1">
            Import {tracks.length} Track{tracks.length !== 1 ? 's' : ''}
          </Dialog.Title>

          {/* Overlap summary chips */}
          <div className="flex items-center gap-2 mb-4">
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">
                <Sparkles size={10} />
                {newCount} new to Rockbot
              </span>
            )}
            {inCatalogCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full">
                <CheckCircle2 size={10} />
                {inCatalogCount} already in catalog
              </span>
            )}
          </div>

          {inCatalogCount > 0 && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">{inCatalogCount} track{inCatalogCount !== 1 ? 's are' : ' is'} already in the Rockbot catalog.</span>
                {' '}Re-ingesting will update those existing song entries.
              </p>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
            {tracks.map(t => {
              const overlap = overlapResults[t.id];
              const isInCatalog = overlap?.inCatalog && overlap.linkedBy === 'isrc';
              return (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                  <img src={t.albumArtUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.artist}</p>
                  </div>
                  {isInCatalog ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-mono flex-shrink-0">
                      <CheckCircle2 size={11} />
                      {overlap.rockbotSongId}
                    </div>
                  ) : (
                    <span className="text-xs text-blue-500 font-medium flex-shrink-0">New</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              Add {tracks.length} to Catalog
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
