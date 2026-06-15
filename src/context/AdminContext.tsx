import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type {
  AppState, AdminTab, Region, ISRCMatchResult, ImportJob, ImportStatus,
  ModalType, TrackSortKey, OverlapResult,
} from '../types';
import { mockImportJobs } from '../data/mockImportJobs';
import { mockTracks } from '../data/mockTracks';
import { mockRockbotSongs } from '../data/mockRockbot';
import { mockRockbotArtists } from '../data/mockRockbotArtists';

const initialState: AppState = {
  activeTab: 'search',
  searchQuery: '',
  selectedRegion: 'ALL',
  matchResults: {},
  selectedTrackIds: [],
  importJobs: mockImportJobs,
  modal: { type: 'none' },
  isPlaying: null,
  sort: { key: null, direction: null },
};

type Action =
  | { type: 'SET_TAB'; tab: AdminTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_REGION_FILTER'; region: Region | 'ALL' }
  | { type: 'SET_MATCH_RESULT'; trackId: string; result: ISRCMatchResult }
  | { type: 'LINK_TRACK'; sevenDigitalId: string; rockbotSongId: string }
  | { type: 'TOGGLE_TRACK_SELECTION'; trackId: string }
  | { type: 'SELECT_ALL_TRACKS'; trackIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_IMPORT_JOB'; job: ImportJob }
  | { type: 'UPDATE_IMPORT_JOB'; jobId: string; status: ImportStatus; error?: string }
  | { type: 'OPEN_MODAL'; modalType: ModalType; payload?: unknown }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_PLAYING'; trackId: string | null }
  | { type: 'SET_SORT'; key: TrackSortKey; }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'SET_REGION_FILTER':
      return { ...state, selectedRegion: action.region };
    case 'SET_MATCH_RESULT':
      return {
        ...state,
        matchResults: { ...state.matchResults, [action.trackId]: action.result },
      };
    case 'LINK_TRACK': {
      const result = state.matchResults[action.sevenDigitalId];
      if (!result?.matchedSong) return state;
      return {
        ...state,
        matchResults: {
          ...state.matchResults,
          [action.sevenDigitalId]: {
            ...result,
            matchedSong: { ...result.matchedSong, linked7DigitalId: action.sevenDigitalId },
          },
        },
      };
    }
    case 'TOGGLE_TRACK_SELECTION': {
      const exists = state.selectedTrackIds.includes(action.trackId);
      return {
        ...state,
        selectedTrackIds: exists
          ? state.selectedTrackIds.filter(id => id !== action.trackId)
          : [...state.selectedTrackIds, action.trackId],
      };
    }
    case 'SELECT_ALL_TRACKS':
      return { ...state, selectedTrackIds: action.trackIds };
    case 'CLEAR_SELECTION':
      return { ...state, selectedTrackIds: [] };
    case 'ADD_IMPORT_JOB':
      return { ...state, importJobs: [action.job, ...state.importJobs] };
    case 'UPDATE_IMPORT_JOB':
      return {
        ...state,
        importJobs: state.importJobs.map(j =>
          j.id === action.jobId
            ? {
                ...j,
                status: action.status,
                error: action.error ?? null,
                completedAt: (action.status === 'imported' || action.status === 'failed')
                  ? new Date().toISOString()
                  : null,
              }
            : j,
        ),
      };
    case 'OPEN_MODAL':
      return { ...state, modal: { type: action.modalType, payload: action.payload } };
    case 'CLOSE_MODAL':
      return { ...state, modal: { type: 'none' } };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.trackId };
    case 'SET_SORT': {
      const isSameKey = state.sort.key === action.key;
      let direction: AppState['sort']['direction'];
      if (!isSameKey) direction = 'asc';
      else if (state.sort.direction === 'asc') direction = 'desc';
      else direction = null;
      return { ...state, sort: { key: direction === null ? null : action.key, direction } };
    }
    default:
      return state;
  }
}

// Build ISRC → RockbotSong lookup (static, only computed once)
const _isrcToRockbotSong: Record<string, { id: string; title: string }> = {};
mockRockbotSongs.forEach(s => {
  if (s.isrc) _isrcToRockbotSong[s.isrc] = { id: s.id, title: s.title };
});

// Build artist name → RockbotArtist lookup (static)
const _artistNameToRockbotArtist: Record<string, { id: string; name: string }> = {};
mockRockbotArtists.forEach(a => {
  _artistNameToRockbotArtist[a.name.toLowerCase()] = a;
});

// Static overlap results (ISRC-based auto detection — never changes)
const _staticOverlapResults: Record<string, OverlapResult> = {};
mockTracks.forEach(t => {
  const hit = _isrcToRockbotSong[t.isrc];
  _staticOverlapResults[t.id] = hit
    ? { inCatalog: true, rockbotSongId: hit.id, rockbotSongTitle: hit.title, linkedBy: 'isrc' }
    : { inCatalog: false, rockbotSongId: null, rockbotSongTitle: null, linkedBy: null };
});

interface AdminContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredTracks: ReturnType<typeof mockTracks.filter>;
  rockbotSongs: typeof mockRockbotSongs;
  rockbotArtists: typeof mockRockbotArtists;
  overlapResults: Record<string, OverlapResult>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const filteredTracks = useMemo(() => {
    const q = state.searchQuery.toLowerCase().trim();
    let tracks = mockTracks.filter(t => {
      if (state.selectedRegion !== 'ALL' && !t.regions.includes(state.selectedRegion)) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.isrc.toLowerCase().includes(q) ||
        t.albumTitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q)
      );
    });

    if (state.sort.key && state.sort.direction) {
      const key = state.sort.key;
      const dir = state.sort.direction;
      tracks = [...tracks].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        const cmp = typeof av === 'string'
          ? av.localeCompare(bv as string)
          : (av as number) - (bv as number);
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return tracks;
  }, [state.searchQuery, state.selectedRegion, state.sort]);

  // Merge static ISRC overlap results with manual link results from state
  const overlapResults = useMemo<Record<string, OverlapResult>>(() => {
    const merged = { ..._staticOverlapResults };
    Object.entries(state.matchResults).forEach(([trackId, matchResult]) => {
      if (matchResult.status === 'matched' && matchResult.matchedSong?.linked7DigitalId === trackId) {
        // Manual link overrides if there's no auto ISRC match
        if (!merged[trackId]?.inCatalog) {
          merged[trackId] = {
            inCatalog: true,
            rockbotSongId: matchResult.matchedSong.id,
            rockbotSongTitle: matchResult.matchedSong.title,
            linkedBy: 'manual',
          };
        }
      }
    });
    return merged;
  }, [state.matchResults]);

  return (
    <AdminContext.Provider value={{
      state,
      dispatch,
      filteredTracks,
      rockbotSongs: mockRockbotSongs,
      rockbotArtists: mockRockbotArtists,
      overlapResults,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

/** Returns the Rockbot artist for a given artist display name, or null if not in catalog. */
export function findRockbotArtist(artistName: string) {
  return _artistNameToRockbotArtist[artistName.toLowerCase()] ?? null;
}
