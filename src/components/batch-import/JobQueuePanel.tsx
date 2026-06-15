import { RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useImportTrack } from '../../hooks/useImportTrack';
import { StatusPill } from '../shared/StatusPill';
import { formatTimestamp } from '../../utils/formatters';

export function JobQueuePanel() {
  const { state } = useAdmin();
  const { retryJob } = useImportTrack();
  const jobs = [...state.importJobs].sort(
    (a, b) => new Date(b.enqueuedAt).getTime() - new Date(a.enqueuedAt).getTime(),
  );

  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Import Queue</h2>
        <p className="text-xs text-gray-400 mt-0.5">{jobs.length} jobs</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {jobs.map(job => (
          <div key={job.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{job.trackTitle}</p>
                <p className="text-xs text-gray-500 truncate">{job.trackArtist}</p>
              </div>
              <StatusPill status={job.status} />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">{formatTimestamp(job.enqueuedAt)}</span>
              {job.status === 'failed' && (
                <button
                  onClick={() => retryJob(job.id)}
                  className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700"
                >
                  <RefreshCw size={10} />
                  Retry
                </button>
              )}
            </div>
            {job.error && (
              <p className="mt-1 text-xs text-red-500 leading-tight">{job.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
