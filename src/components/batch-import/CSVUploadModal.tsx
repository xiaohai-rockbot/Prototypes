import { Dialog } from '@headlessui/react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { mockRockbotSongs } from '../../data/mockRockbot';
import { useAdmin } from '../../context/AdminContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  isrc: string;
  matchedSong: typeof mockRockbotSongs[0] | null;
}

const ISRC_RE = /[A-Z]{2}[A-Z0-9]{3}\d{7}/i;

function parseISRCsFromCSV(text: string): string[] {
  return text
    .split(/\r?\n/)
    .flatMap(line => line.split(','))
    .map(cell => cell.trim().replace(/-/g, '').toUpperCase())
    .filter(v => ISRC_RE.test(v));
}

export function CSVUploadModal({ open, onClose }: Props) {
  const { dispatch } = useAdmin();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const isrcs = parseISRCsFromCSV(text);
      const parsed: ParsedRow[] = isrcs.map(isrc => ({
        isrc,
        matchedSong: mockRockbotSongs.find(s => s.isrc?.replace(/-/g, '') === isrc) ?? null,
      }));
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleConfirm() {
    rows
      .filter(r => r.matchedSong)
      .forEach(r => {
        // Find the 7Digital track with this ISRC
        // In a real system this would be a proper lookup; here we just dispatch what we know
        dispatch({
          type: 'SET_MATCH_RESULT',
          trackId: `csv-${r.isrc}`,
          result: { status: 'matched', matchedSong: r.matchedSong },
        });
      });
    setConfirmed(true);
  }

  function handleClose() {
    setRows([]);
    setFileName('');
    setConfirmed(false);
    onClose();
  }

  const matched = rows.filter(r => r.matchedSong).length;

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Bulk ISRC Match via CSV
            </Dialog.Title>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {!confirmed ? (
            <>
              {rows.length === 0 ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Drop a CSV file here</p>
                  <p className="text-xs text-gray-400 mb-3">One ISRC per line, or comma-separated</p>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="text-xs font-medium px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                  >
                    Choose File
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{fileName}</span>
                    <span className="ml-auto text-xs text-gray-400">{rows.length} ISRCs found</span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-500">ISRC</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-500">Rockbot Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rows.map((row, i) => (
                          <tr key={i} className={row.matchedSong ? 'bg-green-50' : ''}>
                            <td className="px-3 py-2 font-mono text-gray-700">{row.isrc}</td>
                            <td className="px-3 py-2">
                              {row.matchedSong ? (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle2 size={11} />
                                  {row.matchedSong.title} – {row.matchedSong.artist}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <AlertCircle size={11} />
                                  No match
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    <strong className="text-green-600">{matched}</strong> of {rows.length} ISRCs matched in Rockbot catalog.
                    Confirming will link all matched ISRCs.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={matched === 0}
                      className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-40"
                    >
                      Link {matched} Match{matched !== 1 ? 'es' : ''}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500" />
              <p className="text-sm font-medium text-gray-800 mb-1">
                {matched} ISRC{matched !== 1 ? 's' : ''} linked successfully
              </p>
              <p className="text-xs text-gray-400 mb-4">
                The matched tracks have been linked to their Rockbot catalog entries.
              </p>
              <button onClick={handleClose} className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                Done
              </button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
