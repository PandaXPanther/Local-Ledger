import type { RiskLevel } from '@/types/data';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const RISK_CONFIG = {
  low: {
    label: 'Low Risk',
    className: 'bg-green-100 text-success border-green-200',
    dot: 'bg-success',
  },
  moderate: {
    label: 'Moderate Risk',
    className: 'bg-amber-100 text-warning border-amber-200',
    dot: 'bg-warning',
  },
  elevated: {
    label: 'Elevated Risk',
    className: 'bg-red-100 text-danger border-red-200',
    dot: 'bg-danger',
  },
};

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = RISK_CONFIG[level];
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.className} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
