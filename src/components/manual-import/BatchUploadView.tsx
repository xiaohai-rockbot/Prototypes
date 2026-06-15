import { useState, useRef } from 'react';
import {
  FileText, Music2, Download, ChevronRight, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import type { BatchUploadRow, BatchRowValidation, BatchImportSummary } from '../../types';
import { parseCSV, generateCSVTemplate, downloadFile } from '../../utils/csvUtils';
import { validateISRC } from '../../utils/isrcValidation';
import { isSupportedAudioFile } from '../../utils/audioUtils';
import { BatchValidationTable } from './BatchValidationTable';
import { BatchSummaryPanel } from './BatchSummaryPanel';
import { Spinner } from '../shared/Spinner';

type BatchStep = 'setup' | 'validation' | 'ingest' | 'summary';

export function BatchUploadView() {
  const [step, setStep] = useState<BatchStep>('setup');

  // Setup state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [csvDragging, setCsvDragging] = useState(false);
  const [audioDragging, setAudioDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const [parsedRows, setParsedRows] = useState<BatchUploadRow[]>([]);
  const [validations, setValidations] = useState<BatchRowValidation[]>([]);

  // Ingest state
  const [ingestProgress, setIngestProgress] = useState({ current: 0, total: 0 });

  // Summary state
  const [summary, setSummary] = useState<BatchImportSummary | null>(null);

  const audioFileNames = new Set(audioFiles.map(f => f.name));

  // ── Step 1: Setup helpers ────────────────────────────────────────────────

  async function handleCsvFile(f: File) {
    if (!f.name.endsWith('.csv')) {
      setParseError('Only .csv files are accepted');
      return;
    }
    setParseError('');
    setCsvFile(f);
  }

  function handleAudioFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    setAudioFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      const newFiles = arr.filter(f => !existing.has(f.name));
      return [...prev, ...newFiles];
    });
  }

  function removeAudioFile(name: string) {
    setAudioFiles(prev => prev.filter(f => f.name !== name));
  }

  // ── Step 2: Validation ───────────────────────────────────────────────────

  async function runValidation() {
    if (!csvFile) return;
    setParseError('');

    let text: string;
    try {
      text = await csvFile.text();
    } catch {
      setParseError('Could not read CSV file');
      return;
    }

    const rows = parseCSV(text);
    if (rows.length === 0) {
      setParseError('CSV is empty or has no data rows (check that it matches the template format)');
      return;
    }

    const validationResults: BatchRowValidation[] = rows.map(row => {
      const errors: string[] = [];

      if (!row.title.trim()) errors.push('Missing Track Title');
      if (!row.artist.trim()) errors.push('Missing Artist');
      if (!row.isrc.trim()) {
        errors.push('Missing ISRC');
      } else if (validateISRC(row.isrc) === 'invalid') {
        errors.push(`Invalid ISRC format: ${row.isrc}`);
      }
      if (!row.audioFilename.trim()) {
        errors.push('Missing audio filename');
      } else if (!audioFileNames.has(row.audioFilename)) {
        errors.push(`Audio file not found: ${row.audioFilename}`);
      } else if (!isSupportedAudioFile(row.audioFilename)) {
        errors.push(`Unsupported audio format: ${row.audioFilename}`);
      }

      return { rowNum: row.rowNum, title: row.title, valid: errors.length === 0, errors };
    });

    setParsedRows(rows);
    setValidations(validationResults);
    setStep('validation');
  }

  // ── Step 3: Ingest ───────────────────────────────────────────────────────

  async function beginIngest() {
    const validRows = parsedRows.filter(
      row => validations.find(v => v.rowNum === row.rowNum)?.valid
    );
    const total = validRows.length;
    setIngestProgress({ current: 0, total });
    setStep('ingest');

    const results: { rowNum: number; title: string; succeeded: boolean }[] = [];

    for (let i = 0; i < validRows.length; i++) {
      await delay(600 + Math.random() * 500);
      setIngestProgress({ current: i + 1, total });
      results.push({
        rowNum: validRows[i].rowNum,
        title: validRows[i].title,
        succeeded: Math.random() > 0.1, // 90% success rate
      });
    }

    const failed = validations.filter(v => !v.valid);
    const ingestFailed = results.filter(r => !r.succeeded).map(r => ({
      rowNum: r.rowNum,
      title: r.title,
      valid: false,
      errors: ['Upload failed — server error. Please retry.'],
    }));

    setSummary({
      total: parsedRows.length,
      succeeded: results.filter(r => r.succeeded).length,
      failed: ingestFailed.length + failed.length,
      failedRows: [...failed, ...ingestFailed].sort((a, b) => a.rowNum - b.rowNum),
    });

    setStep('summary');
  }

  function handleReset() {
    setStep('setup');
    setCsvFile(null);
    setAudioFiles([]);
    setParsedRows([]);
    setValidations([]);
    setSummary(null);
    setParseError('');
    setIngestProgress({ current: 0, total: 0 });
  }

  const validCount = validations.filter(v => v.valid).length;
  const invalidCount = validations.filter(v => !v.valid).length;

  // ── Render ───────────────────────────────────────────────────────────────

  // Step breadcrumb
  const steps: { key: BatchStep; label: string }[] = [
    { key: 'setup', label: 'Upload Files' },
    { key: 'validation', label: 'Validate' },
    { key: 'ingest', label: 'Ingest' },
    { key: 'summary', label: 'Summary' },
  ];
  const stepOrder = steps.map(s => s.key);
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              i < currentStepIdx
                ? 'bg-green-100 text-green-700'
                : i === currentStepIdx
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {i < currentStepIdx ? '✓ ' : ''}{s.label}
            </span>
            {i < steps.length - 1 && <ChevronRight size={13} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Setup ── */}
      {step === 'setup' && (
        <div className="space-y-5">
          {/* Template download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-blue-800">Step 1: Fill in the CSV template</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Download the template, fill in your track details, then upload it below along with your audio files.
              </p>
            </div>
            <button
              onClick={() => downloadFile(generateCSVTemplate(), 'rockbot-batch-upload-template.csv')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0 ml-4"
            >
              <Download size={14} />
              Download Template
            </button>
          </div>

          {/* CSV upload zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File *
            </label>
            {!csvFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setCsvDragging(true); }}
                onDragLeave={() => setCsvDragging(false)}
                onDrop={e => { e.preventDefault(); setCsvDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCsvFile(f); }}
                onClick={() => csvInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  csvDragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                }`}
              >
                <FileText size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">Drop your filled CSV here</p>
                <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{csvFile.name}</p>
                  <p className="text-xs text-gray-400">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCsvFile(null); if (csvInputRef.current) csvInputRef.current.value = ''; }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Audio files upload zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Files * <span className="text-gray-400 font-normal text-xs">MP3 · WAV · FLAC · AIFF — multiple files OK</span>
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setAudioDragging(true); }}
              onDragLeave={() => setAudioDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setAudioDragging(false);
                handleAudioFiles(e.dataTransfer.files);
              }}
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                audioDragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              }`}
            >
              <Music2 size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">Drop audio files here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse · select multiple files</p>
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.flac,.aiff,.aif,audio/*"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) handleAudioFiles(e.target.files); }}
              />
            </div>

            {audioFiles.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {audioFiles.map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-3 py-2">
                    <Music2 size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate flex-1">{f.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button
                      type="button"
                      onClick={() => removeAudioFile(f.name)}
                      className="text-gray-300 hover:text-red-400 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {audioFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1.5">
                {audioFiles.length} file{audioFiles.length !== 1 ? 's' : ''} added
              </p>
            )}
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {parseError}
            </div>
          )}

          <button
            onClick={runValidation}
            disabled={!csvFile || audioFiles.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Validate CSV
          </button>
        </div>
      )}

      {/* ── STEP 2: Validation ── */}
      {step === 'validation' && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            {validCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                <CheckCircle2 size={11} />
                {validCount} valid row{validCount !== 1 ? 's' : ''}
              </span>
            )}
            {invalidCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                <AlertCircle size={11} />
                {invalidCount} row{invalidCount !== 1 ? 's' : ''} with errors
              </span>
            )}
            <button
              onClick={() => setStep('setup')}
              className="ml-auto text-xs text-gray-400 hover:text-brand-500 underline"
            >
              ← Back
            </button>
          </div>

          {invalidCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              <span>
                <span className="font-semibold">{invalidCount} row{invalidCount !== 1 ? 's' : ''} will be skipped</span> due to validation errors.
                Fix the CSV and re-upload, or proceed to ingest valid rows only.
              </span>
            </div>
          )}

          <BatchValidationTable rows={parsedRows} validations={validations} />

          <button
            onClick={beginIngest}
            disabled={validCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Begin Ingest {validCount > 0 && `(${validCount} track${validCount !== 1 ? 's' : ''})`}
          </button>
        </div>
      )}

      {/* ── STEP 3: Ingest progress ── */}
      {step === 'ingest' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Spinner size={32} />
          <p className="text-sm font-medium text-gray-700">
            Processing {ingestProgress.current} of {ingestProgress.total} tracks…
          </p>
          <div className="w-64 bg-gray-100 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ingestProgress.total > 0 ? (ingestProgress.current / ingestProgress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Converting audio and uploading to GCS…</p>
        </div>
      )}

      {/* ── STEP 4: Summary ── */}
      {step === 'summary' && summary && (
        <BatchSummaryPanel summary={summary} onReset={handleReset} />
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
