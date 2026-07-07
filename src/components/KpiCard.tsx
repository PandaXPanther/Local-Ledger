import type { DataPoint } from '@/types/data';
import { formatDataValue, formatDate } from '@/lib/format';
import { SourceBadge } from './SourceBadge';
import { LastUpdated } from './LastUpdated';

interface KpiCardProps {
  label: string;
  dataPoint: DataPoint | null;
  icon?: React.ReactNode;
  highlight?: boolean;
  comparison?: {
    label: string;
    value: number | null;
    unit: string;
  };
}

export function KpiCard({ label, dataPoint, icon, highlight, comparison }: KpiCardProps) {
  const value = dataPoint?.value ?? null;
  const displayValue = dataPoint
    ? formatDataValue(value, dataPoint.unit)
    : 'Data unavailable';

  return (
    <div className={`kpi-card group ${highlight ? 'border-l-2 border-l-accent border-[#23684A59] bg-[#E4EEE699] shadow-[inset_0_3px_0_#23684A,0_18px_45px_rgba(31,36,33,0.05)]' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="section-label">{label}</span>
        {icon && <div className="text-text-muted transition-colors group-hover:text-accent">{icon}</div>}
      </div>

      <div className={`font-mono text-3xl font-bold tracking-tight ${value === null ? 'text-text-muted' : 'text-ink'}`}>
        {displayValue}
      </div>

      {dataPoint?.date && dataPoint.date !== 'unavailable' && (
        <div className="text-xs text-text-muted mt-1">
          as of {formatDate(dataPoint.date)}
        </div>
      )}

      {comparison && comparison.value !== null && (
        <div className="mt-2 text-xs font-medium text-text-secondary">
          {comparison.label}: {formatDataValue(comparison.value, comparison.unit)}
        </div>
      )}

      {dataPoint && (
        <div className="mt-3 space-y-1">
          <SourceBadge
            name={dataPoint.sourceName}
            url={dataPoint.sourceUrl}
            dataset={dataPoint.sourceDataset}
          />
          <LastUpdated timestamp={dataPoint.lastFetchedAt} />
        </div>
      )}

      {!dataPoint && (
        <div className="mt-3">
          <span className="unavailable-badge">Data unavailable</span>
        </div>
      )}
    </div>
  );
}
