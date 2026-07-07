'use client';

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesPoint } from '@/lib/sim/types';

interface LineSpec {
  key: keyof SeriesPoint;
  name: string;
  color: string;
}

interface ChartPanelProps {
  title: string;
  unit: string;
  data: SeriesPoint[];
  lines: LineSpec[];
  referenceY?: number;
  domain?: [number | 'auto', number | 'auto'];
}

const AXIS_COLOR = '#8D887A';
const GRID_MONO = 'JetBrains Mono, monospace';

function ChartPanel({ title, unit, data, lines, referenceY, domain }: ChartPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-[0_1px_0_rgba(31,36,33,0.08)]">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {title}
        </span>
        <span className="font-mono text-[0.6rem] text-text-muted">{unit}</span>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: GRID_MONO }}
              tickLine={false}
              axisLine={{ stroke: '#DED7C8' }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: GRID_MONO }}
              tickLine={false}
              axisLine={false}
              width={46}
              domain={domain ?? ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFDF7',
                border: '1px solid #DED7C8',
                borderRadius: 8,
                fontFamily: GRID_MONO,
                fontSize: 11,
                color: '#1F2421',
              }}
              labelStyle={{ color: '#1F2421', fontFamily: GRID_MONO, fontSize: 10, fontWeight: 700 }}
              isAnimationActive={false}
            />
            {referenceY !== undefined && (
              <ReferenceLine y={referenceY} stroke="#C8BEAA" strokeDasharray="4 4" />
            )}
            {lines.map(line => (
              <Line
                key={String(line.key)}
                type="monotone"
                dataKey={line.key as string}
                name={line.name}
                stroke={line.color}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {lines.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-3">
          {lines.map(line => (
            <span key={String(line.key)} className="flex items-center gap-1.5 font-mono text-[0.6rem] text-text-muted">
              <span className="inline-block h-0.5 w-3" style={{ background: line.color }} />
              {line.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const GREEN = '#23684A';
const TEAL = '#315B7A';
const EMBER = '#B45F2A';
const RED = '#A23B3B';
const BROWN = '#6E5B3F';
const INK = '#1F2421';

export function SimCharts({ data }: { data: SeriesPoint[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <ChartPanel
        title="Growth and inflation"
        unit="% / yr"
        data={data}
        referenceY={0}
        lines={[
          { key: 'gdpGrowth', name: 'Real GDP growth', color: GREEN },
          { key: 'inflation', name: 'Inflation', color: EMBER },
        ]}
      />
      <ChartPanel
        title="Unemployment"
        unit="%"
        data={data}
        lines={[
          { key: 'unemployment', name: 'Overall', color: INK },
          { key: 'minorityUnemployment', name: 'Excluded group', color: RED },
        ]}
      />
      <ChartPanel
        title="Interest rates"
        unit="%"
        data={data}
        lines={[
          { key: 'policyRate', name: 'Policy rate', color: GREEN },
          { key: 'bondYield', name: '10y bond yield', color: TEAL },
        ]}
      />
      <ChartPanel
        title="Stock market"
        unit="index"
        data={data}
        lines={[{ key: 'stockIndex', name: 'Stock index', color: GREEN }]}
      />
      <ChartPanel
        title="Housing and homelessness"
        unit="index / per 10k"
        data={data}
        lines={[
          { key: 'housePriceIndex', name: 'House prices', color: BROWN },
          { key: 'homelessness', name: 'Homeless per 10k', color: RED },
        ]}
      />
      <ChartPanel
        title="Government debt"
        unit="% of GDP"
        data={data}
        referenceY={100}
        lines={[{ key: 'debtToGdp', name: 'Debt to GDP', color: TEAL }]}
      />
      <ChartPanel
        title="Happiness and mobility"
        unit="0-100"
        data={data}
        domain={[0, 100]}
        lines={[
          { key: 'happiness', name: 'Happiness index', color: GREEN },
          { key: 'socialMobility', name: 'Social mobility', color: BROWN },
        ]}
      />
      <ChartPanel
        title="External position"
        unit="index / % GDP"
        data={data}
        referenceY={0}
        lines={[
          { key: 'fxRate', name: 'Exchange rate', color: TEAL },
          { key: 'tradeBalance', name: 'Trade balance', color: GREEN },
        ]}
      />
      <ChartPanel
        title="Price level and money"
        unit="index / $B"
        data={data}
        lines={[
          { key: 'priceLevel', name: 'Price level', color: EMBER },
          { key: 'moneySupply', name: 'Money supply', color: BROWN },
        ]}
      />
    </div>
  );
}
