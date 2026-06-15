import { Music } from 'lucide-react';

interface Props {
  message?: string;
}

export function EmptyState({ message = 'No tracks found' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Music size={40} className="mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
