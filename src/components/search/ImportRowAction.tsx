import { Dialog } from '@headlessui/react';
import { CheckCircle2, AlertCircle, PlusCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { SevenDigitalTrack } from '../../types';
import { useAdmin, findRockbotArtist } from '../../context/AdminContext';
import { useImportTrack } from '../../hooks/useImportTrack';
import { StatusPill } from '../shared/StatusPill';

interface Props {
  track: SevenDigitalTrack;
}

export function ImportRowAction({ track }: Props) {
  const { state, overlapResults } = useAdmin();
  const { importTracks } = useImportTrack();
  const [open, setOpen] = useState(false);

  const existingJob = state.importJobs.find(j => j.trackId === track.id);
  if (existingJob && existingJob.status !== 'failed') {
    return <StatusPill status={existingJob.status} />;
  }

  const overlap = overlapResults[track.id];
  const isInCatalog = overlap?.inCatalog && overlap.linkedBy === 'isrc';
  const rockbotArtist = findRockbotArtist(track.artist);
  const isFailed = existingJob?.status === 'failed';

  const buttonLabel = isFailed
    ? 'Retry Import'
    : isInCatalog
      ? 'Re-ingest'
      : 'Import';

  const buttonClass = isFailed
    ? 'text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap'
    : isInCatalog
      ? 'text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap border border-gray-300'
      : 'text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors whitespace-nowrap';

  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonClass}>
        {buttonLabel}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <Dialog.Title className="text-base font-semibold text-gray-900 mb-4">
              {isInCatalog ? 'Re-ingest Track' : 'Import Track'}
            </Dialog.Title>

            {/* Track preview card */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <img src={track.albumArtUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{track.title}</p>
                <p className="text-xs text-gray-500">{track.artist} · {track.albumTitle}</p>
                <p className="text-xs text-gray-400 font-mono">{track.isrc}</p>
              </div>
            </div>

            {/* Already in catalog warning */}
            {isInCatalog && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Already in Rockbot Catalog</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This track is matched to{' '}
                    <span className="font-mono font-medium">{overlap.rockbotSongId}</span>
                    {' '}— <span className="font-medium">{overlap.rockbotSongTitle}</span>.
                    Re-ingesting will update the existing song entry.
                  </p>
                </div>
              </div>
            )}

            {/* Ingest actions summary */}
            {!isInCatalog && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  What will be created
                </p>
                <div className="space-y-1.5">
                  {/* Song entry */}
                  <div className="flex items-center gap-2 text-xs">
                    <PlusCircle size={13} className="text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">Song:</span>{' '}
                      <span className="italic text-gray-500">new — will be added to Rockbot backlog</span>
                    </span>
                  </div>
                  {/* Artist entry */}
                  <div className="flex items-center gap-2 text-xs">
                    {rockbotArtist ? (
                      <>
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          <span className="font-medium">Artist:</span>{' '}
                          already exists as{' '}
                          <span className="font-mono text-green-700">{rockbotArtist.id}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} className="text-blue-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          <span className="font-medium">Artist:</span>{' '}
                          <span className="italic text-gray-500">new — will be added to backlog</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  importTracks([{ id: track.id, title: track.title, artist: track.artist }], '', []);
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                {isInCatalog ? 'Re-ingest' : 'Add to Catalog'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
