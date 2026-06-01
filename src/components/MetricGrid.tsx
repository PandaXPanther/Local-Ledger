import { KpiCard } from './KpiCard';
import type { Metric } from '@/lib/nationalData';

export function MetricGrid({ metrics }: { metrics: Array<{ label: string; metric: Metric | null }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(item => (
        <KpiCard key={item.label} label={item.label} dataPoint={item.metric} />
      ))}
    </div>
  );
}
