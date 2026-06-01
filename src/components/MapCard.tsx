interface MapCardProps {
  title: string;
  description?: string;
  source?: { name: string; url: string };
}

export function MapCard({ title, description, source }: MapCardProps) {
  return (
    <div className="card p-6">
      <h3 className="mb-3 font-display text-xl font-bold text-ink">{title}</h3>
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-border bg-canvas">
        <svg className="mb-3 h-12 w-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="px-4 text-center text-sm text-text-muted">
          {description ?? 'Interactive map requires JavaScript. Data available in table format below.'}
        </p>
      </div>
      {source && (
        <div className="source-strip">
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="editorial-link text-xs font-semibold text-accent">
            {source.name}
          </a>
        </div>
      )}
    </div>
  );
}
