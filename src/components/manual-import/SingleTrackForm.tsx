import { useState, useRef } from 'react';
import {
  Upload, Music, Play, Pause, CheckCircle2, XCircle, AlertTriangle, Info
} from 'lucide-react';
import { detectDuration, isSupportedAudioFile, isNonMp3Audio, SUPPORTED_AUDIO_ACCEPT } from '../../utils/audioUtils';
import { validateISRC } from '../../utils/isrcValidation';
import { formatDuration } from '../../utils/formatters';
import { Spinner } from '../shared/Spinner';
import { AlbumArtDropZone } from './AlbumArtDropZone';


type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function SingleTrackForm() {
  // Audio file state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Album art state
  const [albumArt, setAlbumArt] = useState<File | null>(null);
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null);

  // Metadata state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [label, setLabel] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [explicit, setExplicit] = useState(false);

  // Identifiers state
  const [upc, setUpc] = useState('');
  const [isrc, setIsrc] = useState('');
  const [isrcTouched, setIsrcTouched] = useState(false);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const isrcStatus = validateISRC(isrc);
  const isNonMp3 = file ? isNonMp3Audio(file.name) : false;

  async function loadFile(f: File) {
    if (!isSupportedAudioFile(f.name)) {
      setFileError('Unsupported format. Accepted: MP3, WAV, FLAC, AIFF.');
      return;
    }
    setFileError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);
    try {
      const ms = await detectDuration(f);
      setDurationMs(ms);
    } catch {
      setDurationMs(null);
    }
    // Auto-fill title from filename (strip extension + clean up)
    if (!title) {
      setTitle(
        f.name
          .replace(/\.(mp3|wav|flac|aiff?|m4a)$/i, '')
          .replace(/[-_]/g, ' ')
          .trim()
      );
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }

  function togglePlay() {
    if (!audioRef.current || !previewUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !artist || !label || isrcStatus === 'invalid') return;
    setSubmitState('submitting');
    setTimeout(() => {
      setSubmitState(Math.random() < 0.9 ? 'success' : 'error');
    }, 1600);
  }

  function handleReset() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDurationMs(null);
    setIsPlaying(false);
    setFileError('');
    if (albumArtUrl) URL.revokeObjectURL(albumArtUrl);
    setAlbumArt(null);
    setAlbumArtUrl(null);
    setTitle(''); setArtist(''); setAlbum(''); setLabel('');
    setGenre(''); setReleaseDate(''); setExplicit(false);
    setUpc(''); setIsrc(''); setIsrcTouched(false);
    setSubmitState('idle');
  }

  const canSubmit = !!file && !!title && !!artist && !!label &&
    (isrcStatus !== 'invalid') && submitState !== 'submitting';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success banner */}
      {submitState === 'success' && (
        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Track queued for import</p>
            <p className="text-xs text-green-600 mt-0.5">
              "{title}" has been added to the Rockbot catalog and will be self-hosted in GCS.
            </p>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <Info size={11} />
              An email confirmation will be sent when processing is complete.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="ml-auto text-green-400 hover:text-green-600 text-xs underline flex-shrink-0"
          >
            Import another
          </button>
        </div>
      )}

      {/* Error banner */}
      {submitState === 'error' && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Import failed</p>
            <p className="text-xs text-red-600 mt-0.5">Server returned an error. Please try again or contact engineering.</p>
          </div>
          <button
            onClick={() => setSubmitState('idle')}
            className="ml-auto text-red-400 hover:text-red-600 text-xs underline flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Audio file ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio File * <span className="text-gray-400 font-normal text-xs">MP3 · WAV · FLAC · AIFF</span>
          </label>

          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-700 mb-1">Drop an audio file here</p>
              <p className="text-xs text-gray-400">MP3, WAV, FLAC, or AIFF · click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_AUDIO_ACCEPT}
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music size={18} className="text-brand-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                    {durationMs !== null && ` · ${formatDuration(durationMs)}`}
                  </p>
                </div>
                {previewUrl && (
                  <>
                    <audio ref={audioRef} src={previewUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white hover:bg-brand-600 flex-shrink-0"
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); setDurationMs(null); setIsPlaying(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  Remove
                </button>
              </div>
              {isNonMp3 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
                  <Info size={12} className="flex-shrink-0" />
                  This file will be automatically converted to 192kbps MP3 before storage.
                </div>
              )}
            </div>
          )}

          {fileError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle size={11} />{fileError}
            </p>
          )}
        </div>

        {/* ── Album art ── */}
        <AlbumArtDropZone
          value={albumArt}
          previewUrl={albumArtUrl}
          onChange={(f, url) => { setAlbumArt(f); setAlbumArtUrl(url); }}
        />

        {/* ── Track Metadata ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Track Metadata</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Track title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Artist *</label>
              <input
                required
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Artist name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Album</label>
              <input
                value={album}
                onChange={e => setAlbum(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Album name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
              <input
                required
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Record label"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Genre</label>
              <input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Electronic, Pop, Folk…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={e => setReleaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Explicit flag */}
          <div className="flex items-center gap-3 pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={explicit}
                onChange={e => setExplicit(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-1 ${
                explicit ? 'bg-red-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  explicit ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </label>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Explicit Content
                {explicit && (
                  <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">E</span>
                )}
              </p>
              <p className="text-xs text-gray-400">Marks this track as explicit — affects playlist filters and playback logic</p>
            </div>
          </div>

          {durationMs !== null && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duration (auto-detected)</label>
              <input
                readOnly
                value={formatDuration(durationMs)}
                className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm text-gray-500 bg-gray-50"
              />
            </div>
          )}
        </div>

        {/* ── Identifiers ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Identifiers</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">UPC</label>
              <input
                value={upc}
                onChange={e => setUpc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 012345678901"
                maxLength={14}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ISRC</label>
              <input
                value={isrc}
                onChange={e => setIsrc(e.target.value.toUpperCase())}
                onBlur={() => setIsrcTouched(true)}
                className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 ${
                  isrcTouched && isrcStatus === 'invalid'
                    ? 'border-red-400 focus:ring-red-400 bg-red-50'
                    : isrcTouched && isrcStatus === 'valid'
                    ? 'border-green-400 focus:ring-green-400'
                    : 'border-gray-200 focus:ring-brand-500'
                }`}
                placeholder="e.g. USRC11901472"
              />
              {isrcTouched && isrcStatus === 'invalid' && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle size={11} />
                  Invalid ISRC format (e.g. USRC11901472)
                </p>
              )}
              {isrcTouched && isrcStatus === 'valid' && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle2 size={11} />
                  Valid ISRC
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitState === 'submitting' ? (
            <><Spinner size={16} />Uploading…</>
          ) : (
            'Upload & Import'
          )}
        </button>
      </form>
    </div>
  );
}
