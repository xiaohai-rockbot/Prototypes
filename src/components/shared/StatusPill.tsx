import type { ImportStatus } from '../../types';

const styles: Record<ImportStatus, string> = {
  queued: 'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  imported: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const labels: Record<ImportStatus, string> = {
  queued: 'Queued',
  processing: 'Processing…',
  imported: 'Imported',
  failed: 'Failed',
};

interface Props {
  status: ImportStatus;
}

export function StatusPill({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'processing' && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-2.5 w-2.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {labels[status]}
    </span>
  );
}
