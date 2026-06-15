export type AdminTab = 'search' | 'manual-import';

export type Region = 'US' | 'UK' | 'EU' | 'AU' | 'CA';

export interface SevenDigitalTrack {
  id: string;
  title: string;
  artist: string;
  albumTitle: string;
  albumArtUrl: string;
  releaseId: string;
  isrc: string;
  durationMs: number;
  previewUrl: string | null;
  regions: Region[];
  genre: string;
  releaseYear: number;
  releaseDate: string;
  label: string;
}

export interface RockbotArtist {
  id: string;
  name: string;
}

export interface OverlapResult {
  inCatalog: boolean;
  rockbotSongId: string | null;
  rockbotSongTitle: string | null;
  linkedBy: 'isrc' | 'manual' | null;
}

export interface RockbotSong {
  id: string;
  title: string;
  artist: string;
  isrc: string | null;
  linked7DigitalId: string | null;
  genre: string;
}

export type MatchStatus = 'idle' | 'searching' | 'matched' | 'no-match';

export interface ISRCMatchResult {
  status: MatchStatus;
  matchedSong: RockbotSong | null;
}

export type ImportStatus = 'queued' | 'processing' | 'imported' | 'failed';

export interface ImportJob {
  id: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  status: ImportStatus;
  genre: string;
  tags: string[];
  enqueuedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface ManualImportForm {
  file: File | null;
  upc: string;
  isrc: string;
  title: string;
  artist: string;
  album: string;
  label: string;
  genre: string;
  releaseDate: string;
  explicit: boolean;
  albumArt: File | null;
  albumArtUrl: string | null;
  durationMs: number | null;
  previewUrl: string | null;
}

export interface BatchUploadRow {
  rowNum: number;
  title: string;
  artist: string;
  album: string;
  label: string;
  isrc: string;
  upc: string;
  explicit: boolean;
  releaseDate: string;
  audioFilename: string;
}

export interface BatchRowValidation {
  rowNum: number;
  title: string;
  valid: boolean;
  errors: string[];
}

export interface BatchImportSummary {
  total: number;
  succeeded: number;
  failed: number;
  failedRows: BatchRowValidation[];
}

export type SortDirection = 'asc' | 'desc' | null;

export type TrackSortKey = keyof Pick<
  SevenDigitalTrack,
  'title' | 'artist' | 'albumTitle' | 'isrc' | 'durationMs' | 'releaseYear' | 'genre' | 'label' | 'releaseDate'
>;

export interface SortState {
  key: TrackSortKey | null;
  direction: SortDirection;
}

export type ModalType =
  | 'none'
  | 'import-single'
  | 'import-batch'
  | 'link-confirm'
  | 'csv-upload';

export interface AppState {
  activeTab: AdminTab;
  searchQuery: string;
  selectedRegion: Region | 'ALL';
  matchResults: Record<string, ISRCMatchResult>;
  selectedTrackIds: string[];
  importJobs: ImportJob[];
  modal: { type: ModalType; payload?: unknown };
  isPlaying: string | null;
  sort: SortState;
}
