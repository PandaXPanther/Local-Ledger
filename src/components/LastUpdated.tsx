import { formatDate } from '@/lib/format';

interface LastUpdatedProps {
  timestamp: string;
  label?: string;
}

export function LastUpdated({ timestamp, label = 'Updated' }: LastUpdatedProps) {
  if (!timestamp || timestamp === 'unavailable') {
    return <span className="text-xs text-text-muted">Last updated: unknown</span>;
  }

  return (
    <span className="text-xs text-text-muted">
      {label}: {formatDate(timestamp)}
    </span>
  );
}
