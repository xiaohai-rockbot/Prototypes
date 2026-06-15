import { useState, useRef } from 'react';
import { ImagePlus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateAlbumArt } from '../../utils/imageValidation';

interface Props {
  value: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, url: string | null) => void;
}

export function AlbumArtDropZone({ value, previewUrl, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setError('');
    setValidating(true);
    const result = await validateAlbumArt(f);
    setValidating(false);
    if (!result.valid) {
      setError(result.error ?? 'Invalid image');
      onChange(null, null);
      return;
    }
    const url = URL.createObjectURL(f);
    onChange(f, url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange(null, null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Album Art <span className="text-gray-400 font-normal">(JPEG or PNG, min 500×500px)</span>
      </label>

      {!value ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
          }`}
        >
          <ImagePlus size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="text-xs text-gray-500">Drop image here or <span className="text-brand-500 font-medium">browse</span></p>
          {validating && <p className="text-xs text-gray-400 mt-1">Validating…</p>}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
          <img
            src={previewUrl ?? ''}
            alt="Album art preview"
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{value.name}</p>
            <p className="text-xs text-gray-400">{(value.size / 1024).toFixed(0)} KB</p>
            <p className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
              <CheckCircle2 size={11} />
              Valid image
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle size={11} />{error}
        </p>
      )}
    </div>
  );
}
