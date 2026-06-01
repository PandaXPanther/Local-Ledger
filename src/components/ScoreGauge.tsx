'use client';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  methodologyNote?: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#23684A';
  if (score >= 50) return '#315B7A';
  if (score >= 30) return '#B45F2A';
  return '#A23B3B';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Weak';
  return 'Very Weak';
}

export function ScoreGauge({ score, label = 'Local Economy Score', size = 'md', methodologyNote }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);
  const scoreLabel = getScoreLabel(clampedScore);

  // Gauge arc parameters
  const radius = size === 'lg' ? 60 : size === 'sm' ? 36 : 48;
  const stroke = size === 'lg' ? 10 : size === 'sm' ? 7 : 9;
  const cx = radius + stroke;
  const cy = radius + stroke;
  const svgSize = (radius + stroke) * 2;

  const circumference = Math.PI * radius; // half circle
  const dashoffset = circumference * (1 - clampedScore / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: cx }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="overflow-visible"
          role="img"
          aria-label={`${label}: ${clampedScore} out of 100 - ${scoreLabel}`}
        >
          {/* Background track */}
          <path
            d={`M ${stroke} ${cy} A ${radius} ${radius} 0 0 1 ${svgSize - stroke} ${cy}`}
            fill="none"
            stroke="#DED7C8"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${stroke} ${cy} A ${radius} ${radius} 0 0 1 ${svgSize - stroke} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
          {/* Score text */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: size === 'lg' ? 28 : size === 'sm' ? 18 : 22, fontWeight: 800, fill: '#1F2421', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {clampedScore}
          </text>
          <text
            x={cx}
            y={cy + (size === 'lg' ? 18 : 14)}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }}
          >
            / 100
          </text>
        </svg>
      </div>

      <div className="text-center">
        <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">{label}</div>
        <div className="mt-0.5 text-sm font-bold" style={{ color }}>
          {scoreLabel}
        </div>
      </div>

      {methodologyNote && (
        <p className="text-xs text-text-muted text-center max-w-xs leading-relaxed">
          {methodologyNote}
        </p>
      )}
    </div>
  );
}
