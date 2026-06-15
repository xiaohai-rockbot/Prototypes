import { useState } from 'react';
import { Music, Layers } from 'lucide-react';
import { SingleTrackForm } from './SingleTrackForm';
import { BatchUploadView } from './BatchUploadView';

type Mode = 'single' | 'batch';

export function ManualImportView() {
  const [mode, setMode] = useState<Mode>('single');

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Manual Content Import</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload content not available in Massive Music. Files are converted to 192kbps MP3 and self-hosted in Rockbot's GCS bucket.
          </p>
        </div>

        {/* Mode tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-7 w-fit">
          <button
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Music size={15} />
            Single Track
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'batch'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={15} />
            Batch Upload
          </button>
        </div>

        {mode === 'single' && <SingleTrackForm />}
        {mode === 'batch' && <BatchUploadView />}
      </div>
    </div>
  );
}
