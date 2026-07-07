'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { SourceBadge } from './SourceBadge';
import { LastUpdated } from './LastUpdated';

interface BarChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  labelKey: string;
  color?: string;
  source?: { name: string; url: string; dataset: string };
  lastUpdated?: string;
  height?: number;
  methodologyNote?: string;
  layout?: 'vertical' | 'horizontal';
}

export function BarChartCard({
  title,
  data,
  dataKey,
  labelKey,
  color = '#23684A',
  source,
  lastUpdated,
  height = 260,
  methodologyNote,
  layout = 'horizontal',
}: BarChartCardProps) {
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
        {layout === 'horizontal' ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED7C8" vertical={false} />
            <XAxis
              dataKey={labelKey}
              tick={{ fontSize: 11, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#DED7C8' }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ border: '1px solid #DED7C8', borderRadius: 8, fontSize: 12, background: '#FFFDF7' }}
              labelStyle={{ fontWeight: 700, color: '#1F2421' }}
            />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={color} fillOpacity={0.85 - i * 0.02} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#DED7C8" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#8D887A', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey={labelKey}
              tick={{ fontSize: 11, fill: '#5D625A' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ border: '1px solid #DED7C8', borderRadius: 8, fontSize: 12, background: '#FFFDF7' }}
              labelStyle={{ fontWeight: 700, color: '#1F2421' }}
            />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} fill={color} />
          </BarChart>
        )}
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
