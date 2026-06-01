'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { SourceBadge } from './SourceBadge';
import { LastUpdated } from './LastUpdated';

interface ChartSeries {
  dataKey: string;
  label: string;
  color?: string;
}

interface LineChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  series: ChartSeries[];
  xAxisKey: string;
  yAxisLabel?: string;
  source?: { name: string; url: string; dataset: string };
  lastUpdated?: string;
  height?: number;
  methodologyNote?: string;
}

const COLORS = ['#23684A', '#315B7A', '#B45F2A', '#A23B3B', '#6E5B3F'];

export function LineChartCard({
  title,
  data,
  series,
  xAxisKey,
  yAxisLabel,
  source,
  lastUpdated,
  height = 260,
  methodologyNote,
}: LineChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="mb-2 text-sm font-semibold text-text-secondary">{title}</h3>
        <div className="flex h-32 items-center justify-center text-sm text-text-muted">
          Data unavailable
        </div>
        {source && <SourceBadge name={source.name} url={source.url} dataset={source.dataset} />}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4 font-display text-xl font-bold text-ink">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DED7C8" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#DED7C8' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#8D887A' } } : undefined}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #DED7C8', borderRadius: 8, fontSize: 12, background: '#FFFDF7' }}
            labelStyle={{ fontWeight: 700, color: '#1F2421' }}
          />
          {series.length > 1 && <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color ?? COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="source-strip">
        {source && <SourceBadge name={source.name} url={source.url} dataset={source.dataset} />}
        {lastUpdated && <LastUpdated timestamp={lastUpdated} />}
      </div>
      {methodologyNote && (
        <p className="text-xs text-text-muted mt-2 leading-relaxed">{methodologyNote}</p>
      )}
    </div>
  );
}
