interface MapCardProps {
  title: string;
  description?: string;
  source?: { name: string; url: string };
}

export function MapCard({ title, description, source }: MapCardProps) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-text-primary mb-3">{title}</h3>
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-border h-64">
        <svg className="w-12 h-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm text-text-muted text-center px-4">
          {description ?? 'Interactive map requires JavaScript. Data available in table format below.'}
        </p>
      </div>
      {source && (
        <div className="source-strip">
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue hover:underline">
            {source.name}
          </a>
        </div>
      )}
    </div>
  );
}
