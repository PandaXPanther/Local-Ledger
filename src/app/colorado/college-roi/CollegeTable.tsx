'use client';

import { DataTable } from '@/components/DataTable';
import { DownloadCsvButton } from '@/components/DownloadCsvButton';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import type { Column } from '@/components/DataTable';

interface CollegeRow extends Record<string, unknown> {
  name: string;
  city: string;
  type: string;
  netPrice: number | null;
  graduationRate: number | null;
  medianEarnings: number | null;
  medianDebt: number | null;
  debtToEarningsRatio: number | null;
  valueScore: number | null;
}

interface CollegeTableProps {
  colleges: Record<string, unknown>[];
}

function mapCollege(raw: Record<string, unknown>): CollegeRow {
  if ('unitId' in raw) {
    return {
      name: (raw.name as string) ?? 'Unknown',
      city: (raw.city as string) ?? '',
      type: (raw.type as string) ?? 'Unknown',
      netPrice: raw.netPrice as number | null,
      graduationRate: raw.graduationRate !== null && raw.graduationRate !== undefined ? (raw.graduationRate as number) * 100 : null,
      medianEarnings: raw.medianEarnings as number | null,
      medianDebt: raw.medianDebt as number | null,
      debtToEarningsRatio: raw.debtToEarningsRatio as number | null,
      valueScore: raw.valueScore as number | null,
    };
  }

  const netPricePublic = raw['latest.cost.avg_net_price.public'] as number | null;
  const netPricePrivate = raw['latest.cost.avg_net_price.private'] as number | null;
  const netPrice = netPricePublic ?? netPricePrivate ?? null;

  const gradRate = raw['latest.completion.rate_suppressed.overall'] as number | null;
  const earnings = raw['latest.earnings.10_yrs_after_entry.median'] as number | null;
  const debt = raw['latest.aid.median_debt.completers.overall'] as number | null;

  const ownership = raw['school.ownership'] as number | null;
  const typeMap: Record<number, string> = { 1: 'Public', 2: 'Private nonprofit', 3: 'Private for-profit' };
  const type = ownership ? (typeMap[ownership] ?? 'Unknown') : 'Unknown';

  // Debt-to-earnings ratio
  const d2e =
    debt !== null && earnings !== null && earnings > 0
      ? Math.round((debt / earnings) * 100) / 100
      : null;

  // Value score: composite
  let valueScore: number | null = null;
  {
    let ws = 0, wt = 0;
    if (earnings !== null && earnings > 0) {
      ws += Math.min(100, (earnings / 100000) * 100) * 0.4;
      wt += 0.4;
    }
    if (gradRate !== null) {
      ws += gradRate * 100 * 0.3;
      wt += 0.3;
    }
    if (netPrice !== null && netPrice > 0) {
      ws += Math.max(0, 100 - (netPrice / 50000) * 100) * 0.2;
      wt += 0.2;
    }
    if (debt !== null && earnings !== null && earnings > 0) {
      ws += Math.max(0, 100 - (debt / earnings) * 50) * 0.1;
      wt += 0.1;
    }
    if (wt > 0) {
      valueScore = Math.round(ws / wt);
    }
  }

  return {
    name: (raw['school.name'] as string) ?? 'Unknown',
    city: (raw['school.city'] as string) ?? '',
    type,
    netPrice,
    graduationRate: gradRate !== null ? gradRate * 100 : null,
    medianEarnings: earnings,
    medianDebt: debt,
    debtToEarningsRatio: d2e,
    valueScore,
  };
}

const COLUMNS: Column<CollegeRow>[] = [
  { key: 'name', label: 'Institution', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  {
    key: 'netPrice',
    label: 'Net Price/Yr',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? formatCurrency(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'graduationRate',
    label: 'Grad Rate',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? formatPercent(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'medianEarnings',
    label: 'Median Earnings (10yr)',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? formatCurrency(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'medianDebt',
    label: 'Median Debt',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? formatCurrency(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'debtToEarningsRatio',
    label: 'Debt/Earnings',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? formatNumber(v as number, 2) + '×' : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'valueScore',
    label: 'Value Score',
    sortable: true,
    align: 'right',
    render: (v) => v !== null ? (
      <span className={`font-bold ${(v as number) >= 70 ? 'text-success' : (v as number) >= 50 ? 'text-brand-blue' : 'text-warning'}`}>
        {v as number}
      </span>
    ) : <span className="unavailable-badge">N/A</span>,
  },
];

export default function CollegeTable({ colleges }: CollegeTableProps) {
  const rows = colleges.map(mapCollege);

  const csvData = rows.map(r => ({
    Institution: r.name,
    City: r.city,
    Type: r.type,
    'Net Price (USD)': r.netPrice ?? '',
    'Graduation Rate (%)': r.graduationRate ?? '',
    'Median Earnings 10yr (USD)': r.medianEarnings ?? '',
    'Median Debt (USD)': r.medianDebt ?? '',
    'Debt-to-Earnings Ratio': r.debtToEarningsRatio ?? '',
    'Value Score (0-100)': r.valueScore ?? '',
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DownloadCsvButton data={csvData} filename="colorado-college-roi" />
      </div>
      <p className="text-xs text-text-muted">
        Source: College Scorecard (U.S. Dept. of Education) · Debt-to-Earnings and Value Score are computed indicators - see methodology.
      </p>
      <DataTable
        columns={COLUMNS}
        data={rows}
        caption="Colorado college ROI data"
        searchable
        searchKeys={['name', 'city', 'type']}
        pageSize={20}
      />
    </div>
  );
}
