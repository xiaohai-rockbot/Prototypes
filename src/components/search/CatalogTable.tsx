import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { SevenDigitalTrack, TrackSortKey } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { CopyableId } from '../shared/CopyableId';
import { CatalogStatusCell } from './CatalogStatusCell';
import { ImportRowAction } from './ImportRowAction';
import { EmptyState } from '../shared/EmptyState';
import { formatDuration } from '../../utils/formatters';

const visibleColumns: { key: TrackSortKey | '_status' | '_import'; label: string; sortable: boolean }[] = [
  { key: 'title',       label: 'Title',        sortable: true  },
  { key: 'artist',      label: 'Artist',       sortable: true  },
  { key: 'albumTitle',  label: 'Album',        sortable: true  },
  { key: 'releaseDate', label: 'Release Date', sortable: true  },
  { key: 'label',       label: 'Label',        sortable: true  },
  { key: 'isrc',        label: 'ISRC',         sortable: true  },
  { key: 'genre',       label: 'Genre',        sortable: true  },
  { key: 'durationMs',  label: 'Duration',     sortable: true  },
  { key: '_status',     label: 'Catalog',      sortable: false },
  { key: '_import',     label: 'Import',       sortable: false },
];

function SortIcon({ colKey, label }: { colKey: string; label: string }) {
  const { state, dispatch } = useAdmin();
  const active = state.sort.key === colKey;

  return (
    <button
      onClick={() => dispatch({ type: 'SET_SORT', key: colKey as TrackSortKey })}
      className="inline-flex items-center gap-0.5 group"
    >
      <span>{label}</span>
      <span className={`ml-1 ${active ? 'text-brand-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
        {active && state.sort.direction === 'asc'  && <ChevronUp   size={13} />}
        {active && state.sort.direction === 'desc' && <ChevronDown  size={13} />}
        {!active && <ChevronsUpDown size={13} />}
      </span>
    </button>
  );
}

interface Props {
  tracks: SevenDigitalTrack[];
}

export function CatalogTable({ tracks }: Props) {
  const { state, dispatch } = useAdmin();
  const allSelected = tracks.length > 0 && tracks.every(t => state.selectedTrackIds.includes(t.id));

  if (tracks.length === 0) {
    return <EmptyState message="No tracks match your search or filter" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => {
                  if (e.target.checked) dispatch({ type: 'SELECT_ALL_TRACKS', trackIds: tracks.map(t => t.id) });
                  else dispatch({ type: 'CLEAR_SELECTION' });
                }}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              7D Track ID
            </th>
            {visibleColumns.map(col => (
              <th
                key={col.label}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {col.sortable
                  ? <SortIcon colKey={col.key as string} label={col.label} />
                  : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => {
            const selected = state.selectedTrackIds.includes(track.id);
            return (
              <tr
                key={track.id}
                className={`border-b border-gray-100 transition-colors ${
                  selected ? 'bg-brand-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                } hover:bg-brand-50/50`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => dispatch({ type: 'TOGGLE_TRACK_SELECTION', trackId: track.id })}
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <CopyableId value={track.id} uid={`td-${track.id}`} />
                </td>
                {/* Title */}
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px]">
                  <span className="block truncate">{track.title}</span>
                </td>
                {/* Artist */}
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{track.artist}</td>
                {/* Album: art + title */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={track.albumArtUrl} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                    <span className="text-gray-700 truncate max-w-[140px]">{track.albumTitle}</span>
                  </div>
                </td>
                {/* Release Date: date + Release ID */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-gray-600 text-xs">{track.releaseDate}</span>
                  <div>
                    <CopyableId value={track.releaseId} uid={`rid-${track.id}`} />
                  </div>
                </td>
                {/* Label */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{track.label}</td>
                {/* ISRC */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  <CopyableId value={track.isrc} uid={`isrc-${track.id}`} />
                </td>
                {/* Genre */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{track.genre}</td>
                {/* Duration */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDuration(track.durationMs)}</td>
                {/* Catalog Status */}
                <td className="px-4 py-3">
                  <CatalogStatusCell track={track} />
                </td>
                {/* Import */}
                <td className="px-4 py-3">
                  <ImportRowAction track={track} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
