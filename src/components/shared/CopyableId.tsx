import { Copy, Check } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface Props {
  value: string;
  uid?: string;
}

export function CopyableId({ value, uid }: Props) {
  const id = uid ?? value;
  const { copiedId, copy } = useClipboard();
  const copied = copiedId === id;

  return (
    <button
      onClick={() => copy(value, id)}
      className="group inline-flex items-center gap-1 text-brand-500 hover:text-brand-700 font-medium text-sm transition-colors"
      title={copied ? 'Copied!' : 'Click to copy'}
    >
      {value}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {copied
          ? <Check size={12} className="text-green-500" />
          : <Copy size={12} />
        }
      </span>
    </button>
  );
}
