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
    <div className={`kpi-card ${highlight ? 'border-brand-blue/30 bg-blue-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="section-label">{label}</span>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>

      <div className={`text-3xl font-bold ${value === null ? 'text-text-muted' : 'text-text-primary'}`}>
        {displayValue}
      </div>

      {dataPoint?.date && dataPoint.date !== 'unavailable' && (
        <div className="text-xs text-text-muted mt-1">
          as of {formatDate(dataPoint.date)}
        </div>
      )}

      {comparison && comparison.value !== null && (
        <div className="text-xs text-text-secondary mt-2">
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
