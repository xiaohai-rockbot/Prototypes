import { CheckCircle2, XCircle, Download, Info, RotateCcw } from 'lucide-react';
import type { BatchImportSummary } from '../../types';
import { generateErrorReport, downloadFile } from '../../utils/csvUtils';

interface Props {
  summary: BatchImportSummary;
  onReset: () => void;
}

export function BatchSummaryPanel({ summary, onReset }: Props) {
  function handleDownloadErrors() {
    const csv = generateErrorReport(summary.failedRows);
    downloadFile(csv, 'batch-import-errors.csv');
  }

  return (
    <div className="space-y-5">
      {/* Headline counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total rows</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{summary.succeeded}</p>
          <p className="text-xs text-green-600 mt-0.5">Imported</p>
        </div>
        <div className={`border rounded-xl p-4 text-center ${summary.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-2xl font-bold ${summary.failed > 0 ? 'text-red-700' : 'text-gray-400'}`}>{summary.failed}</p>
          <p className={`text-xs mt-0.5 ${summary.failed > 0 ? 'text-red-500' : 'text-gray-400'}`}>Failed</p>
        </div>
      </div>

      {/* Email confirmation note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          <span className="font-semibold">An email report will be sent</span> to your team when all processing is complete.
          Successfully imported tracks will appear in GCS once converted to 192kbps MP3.
        </p>
      </div>

      {/* Failed rows detail */}
      {summary.failedRows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <XCircle size={14} className="text-red-500" />
              Failed Rows ({summary.failedRows.length})
            </h3>
            <button
              onClick={handleDownloadErrors}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <Download size={12} />
              Download Error Report
            </button>
          </div>
          <div className="border border-red-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-red-50 border-b border-red-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-red-600 w-12">Row</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-red-600">Track</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-red-600">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {summary.failedRows.map(row => (
                  <tr key={row.rowNum} className="bg-white">
                    <td className="px-3 py-2 font-mono text-gray-400">{row.rowNum}</td>
                    <td className="px-3 py-2 font-medium text-gray-700">{row.title || '—'}</td>
                    <td className="px-3 py-2 text-red-600">
                      {row.errors.map((e, i) => (
                        <span key={i} className="block">{e}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Succeeded rows (collapsed list) */}
      {summary.succeeded > 0 && (
        <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
          <CheckCircle2 size={14} />
          {summary.succeeded} track{summary.succeeded !== 1 ? 's' : ''} successfully queued for import and conversion.
        </div>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
      >
        <RotateCcw size={14} />
        Start a new batch upload
      </button>
    </div>
  );
}
