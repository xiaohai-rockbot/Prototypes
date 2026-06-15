import type { BatchUploadRow, BatchRowValidation } from '../types';

const CSV_HEADERS = [
  'Track Title',
  'Artist',
  'Album',
  'Label',
  'ISRC',
  'UPC',
  'Explicit (Y/N)',
  'Release Date',
  'Audio Filename',
];

export function generateCSVTemplate(): string {
  const header = CSV_HEADERS.join(',');
  const ex1 = 'Neon Drifter,Solaris Echo,Ultrawave,Pulse Records,USRC11901472,012345678901,N,2023-02-03,neon_drifter.mp3';
  const ex2 = 'Hollow Crown,The Meridian,Kingdom Drift,North Atlantic Records,GBRC11431309,,Y,2022-03-11,hollow_crown.wav';
  return [header, ex1, ex2].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): BatchUploadRow[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return []; // header only or empty

  // Skip header (line 0)
  const rows: BatchUploadRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length === 0) continue;
    rows.push({
      rowNum: i + 1, // spreadsheet row number (1-indexed, header = row 1)
      title:         cols[0] ?? '',
      artist:        cols[1] ?? '',
      album:         cols[2] ?? '',
      label:         cols[3] ?? '',
      isrc:          (cols[4] ?? '').toUpperCase(),
      upc:           cols[5] ?? '',
      explicit:      (cols[6] ?? '').trim().toUpperCase() === 'Y',
      releaseDate:   cols[7] ?? '',
      audioFilename: cols[8] ?? '',
    });
  }
  return rows;
}

/** Naive CSV line splitter — handles quoted fields with commas. */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function generateErrorReport(failures: BatchRowValidation[]): string {
  const header = 'Row #,Track Title,Errors';
  const rows = failures.map(f => {
    const errors = f.errors.join('; ');
    const title = f.title.includes(',') ? `"${f.title}"` : f.title;
    const errCell = errors.includes(',') ? `"${errors}"` : errors;
    return `${f.rowNum},${title},${errCell}`;
  });
  return [header, ...rows].join('\n');
}
