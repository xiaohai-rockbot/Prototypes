import { useState, useCallback } from 'react';

export function useClipboard(timeout = 1500) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback((value: string, id: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    });
  }, [timeout]);

  return { copiedId, copy };
}
