import { CheckCircle2, Sparkles, Link2, X, Search } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useState, useMemo } from 'react';
import type { SevenDigitalTrack, RockbotSong } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface Props {
  track: SevenDigitalTrack;
}

export function CatalogStatusCell({ track }: Props) {
  const { state, dispatch, overlapResults, rockbotSongs } = useAdmin();
  const [searchOpen, setSearchOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<RockbotSong | null>(null);

  const overlap = overlapResults[track.id];
  const manualResult = state.matchResults[track.id];
  const isManualLinked =
    manualResult?.status === 'matched' &&
    manualResult.matchedSong?.linked7DigitalId === track.id;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rockbotSongs;
    return rockbotSongs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.isrc?.toLowerCase().includes(q) ?? false),
    );
  }, [query, rockbotSongs]);

  function openSearch() {
    setQuery('');
    setSelected(null);
    setSearchOpen(true);
  }

  function handleSelect(song: RockbotSong) {
    setSelected(song);
    setSearchOpen(false);
    setConfirmOpen(true);
  }

  function handleConfirmLink() {
    if (!selected) return;
    dispatch({
      type: 'SET_MATCH_RESULT',
      trackId: track.id,
      result: {
        status: 'matched',
        matchedSong: { ...selected, linked7DigitalId: track.id },
      },
    });
    setConfirmOpen(false);
    setSelected(null);
  }

  // ── Auto ISRC match ───────────────────────────────────────────────────────
  if (overlap?.inCatalog && overlap.linkedBy === 'isrc') {
    return (
      <div className="flex flex-col gap-0.5 min-w-[140px]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full w-fit">
          <CheckCircle2 size={11} className="text-green-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-green-700">In Catalog</span>
        </div>
        <span className="text-xs font-mono text-green-600 pl-0.5">{overlap.rockbotSongId}</span>
        <span className="text-xs text-gray-400 truncate max-w-[140px] pl-0.5">{overlap.rockbotSongTitle}</span>
      </div>
    );
  }

  // ── Manual link (ISRCs differed but curator linked explicitly) ────────────
  if (isManualLinked) {
    const song = manualResult!.matchedSong!;
    const isrcMismatch = song.isrc && song.isrc !== track.isrc;
    return (
      <div className="flex flex-col gap-0.5 min-w-[140px]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 border border-brand-200 rounded-full w-fit">
          <Link2 size={11} className="text-brand-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-brand-700">Linked</span>
        </div>
        <span className="text-xs font-mono text-brand-500 pl-0.5">{song.id}</span>
        <span className="text-xs text-gray-400 truncate max-w-[140px] pl-0.5">{song.title}</span>
        {isrcMismatch && (
          <span className="text-xs text-amber-500 pl-0.5" title={`Rockbot ISRC: ${song.isrc}`}>
            ISRC mismatch
          </span>
        )}
        <button
          onClick={openSearch}
          className="text-xs text-gray-400 hover:text-brand-500 underline text-left pl-0.5 mt-0.5"
        >
          Re-link
        </button>
      </div>
    );
  }

  // ── New to Rockbot ────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full w-fit">
          <Sparkles size={11} className="text-blue-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-blue-600">New to Rockbot</span>
        </div>
        <button
          onClick={openSearch}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors text-left"
          title="Manually link to an existing Rockbot song if ISRCs differ"
        >
          <Link2 size={10} />
          <span className="underline">Find in Rockbot</span>
        </button>
      </div>

      {/* Rockbot song search dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <Dialog.Title className="text-base font-semibold text-gray-900">
                  Find Rockbot Song to Link
                </Dialog.Title>
                <p className="text-xs text-gray-500 mt-1">
                  Linking to:{' '}
                  <span className="font-medium text-gray-700">{track.title}</span>
                  {' '}by{' '}
                  <span className="font-medium text-gray-700">{track.artist}</span>
                  <span className="ml-1 font-mono text-gray-400">({track.isrc})</span>
                </p>
              </div>
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 mt-0.5">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by song title, artist, song ID, or ISRC…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {filtered.length} song{filtered.length !== 1 ? 's' : ''} in Rockbot catalog
              </p>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-gray-100 divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No songs match your search</div>
              ) : (
                filtered.map(song => (
                  <button
                    key={song.id}
                    onClick={() => handleSelect(song)}
                    className="w-full text-left px-5 py-3 hover:bg-brand-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-700">
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs font-mono text-gray-400">{song.id}</span>
                          {song.isrc ? (
                            <span className="text-xs font-mono text-gray-400">{song.isrc}</span>
                          ) : (
                            <span className="text-xs text-amber-500 italic">No ISRC</span>
                          )}
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg bg-brand-50 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Confirmation dialog */}
      {selected && (
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <Dialog.Title className="text-base font-semibold text-gray-900 mb-3">
                Confirm Link
              </Dialog.Title>

              <div className="space-y-2 mb-4">
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">7Digital Track</p>
                  <p className="text-sm font-medium text-gray-800">{track.title}</p>
                  <p className="text-xs text-gray-500">{track.artist}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{track.isrc} · {track.id}</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-brand-500 font-medium">
                    <Link2 size={12} />
                    will be linked to
                  </div>
                </div>
                <div className="bg-brand-50 rounded-xl px-3 py-2.5 border border-brand-100">
                  <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1">Rockbot Song</p>
                  <p className="text-sm font-medium text-brand-800">{selected.title}</p>
                  <p className="text-xs text-brand-600">{selected.artist}</p>
                  <p className="text-xs font-mono text-brand-400 mt-0.5">
                    {selected.isrc ?? 'No ISRC'} · {selected.id}
                  </p>
                </div>
              </div>

              {selected.isrc && selected.isrc !== track.isrc && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">ISRCs differ.</span> Rockbot has{' '}
                    <span className="font-mono">{selected.isrc}</span>, 7Digital has{' '}
                    <span className="font-mono">{track.isrc}</span>. This link overrides the ISRC mismatch.
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setConfirmOpen(false); setSearchOpen(true); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmLink}
                  className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                >
                  Confirm Link
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
}
