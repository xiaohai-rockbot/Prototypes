import { CheckCircle2, XCircle } from 'lucide-react';
import type { BatchUploadRow, BatchRowValidation } from '../../types';

interface Props {
  rows: BatchUploadRow[];
  validations: BatchRowValidation[];
}

export function BatchValidationTable({ rows, validations }: Props) {
  const validMap = Object.fromEntries(validations.map(v => [v.rowNum, v]));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">Row</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Artist</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ISRC</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Audio File</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => {
            const v = validMap[row.rowNum];
            const isValid = v?.valid ?? false;
            const errors = v?.errors ?? [];
            return (
              <tr
                key={row.rowNum}
                className={isValid ? 'bg-white' : 'bg-red-50/50'}
              >
                <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{row.rowNum}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[140px]">
                  <span className="block truncate">{row.title || <span className="text-gray-400 italic">—</span>}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-600 max-w-[120px]">
                  <span className="block truncate">{row.artist || <span className="text-gray-400 italic">—</span>}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{row.isrc || '—'}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500 max-w-[140px]">
                  <span className="block truncate">{row.audioFilename || '—'}</span>
                </td>
                <td className="px-4 py-2.5">
                  {isValid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 size={12} />
                      Valid
                    </span>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 mb-1">
                        <XCircle size={12} />
                        Invalid
                      </span>
                      <ul className="space-y-0.5">
                        {errors.map((err, i) => (
                          <li key={i} className="text-xs text-red-500 leading-tight">• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
