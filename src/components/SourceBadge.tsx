interface SourceBadgeProps {
  name: string;
  url: string;
  dataset?: string;
  seriesId?: string;
}

export function SourceBadge({ name, url, dataset, seriesId }: SourceBadgeProps) {
  return (
    <div className="flex items-start gap-1.5">
      <svg className="w-3 h-3 mt-0.5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <div className="text-xs text-text-muted">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue hover:underline font-medium"
        >
          {name}
        </a>
        {dataset && <span className="text-text-muted"> · {dataset}</span>}
        {seriesId && <span className="text-text-muted font-mono"> [{seriesId}]</span>}
      </div>
    </div>
  );
}
