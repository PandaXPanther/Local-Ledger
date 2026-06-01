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
  color = '#2563EB',
  source,
  lastUpdated,
  height = 260,
  methodologyNote,
  layout = 'horizontal',
}: BarChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">{title}</h3>
        <div className="flex items-center justify-center h-32 text-text-muted text-sm">
          Data unavailable
        </div>
        {source && <SourceBadge name={source.name} url={source.url} dataset={source.dataset} />}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-text-primary mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {layout === 'horizontal' ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey={labelKey}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ fontWeight: 600, color: '#0F172A' }}
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey={labelKey}
              tick={{ fontSize: 11, fill: '#475569' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ fontWeight: 600, color: '#0F172A' }}
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
