'use client';

import { DataTable } from '@/components/DataTable';
import { DownloadCsvButton } from '@/components/DownloadCsvButton';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import type { Column } from '@/components/DataTable';

interface CountyRow extends Record<string, unknown> {
  county: string;
  fips?: string;
  population?: number | null;
  medianHouseholdIncome?: number | null;
  unemploymentRate?: number | null;
  populationGrowth?: number | null;
  federalSpendingPerCapita?: number | null;
  housingPressureScore?: number | null;
  localEconomyScore?: number | null;
  lastUpdated?: string;
}

interface CountiesClientProps {
  counties: Record<string, unknown>[];
}

const COLUMNS: Column<CountyRow>[] = [
  { key: 'county', label: 'County', sortable: true },
  {
    key: 'population',
    label: 'Population',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? formatNumber(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'medianHouseholdIncome',
    label: 'Median HH Income',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? formatCurrency(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'unemploymentRate',
    label: 'Unemployment Rate',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? formatPercent(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'populationGrowth',
    label: 'Pop. Growth',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? formatPercent(v as number, 2) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'federalSpendingPerCapita',
    label: 'Federal Spending/Capita',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? formatCurrency(v as number) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'housingPressureScore',
    label: 'Housing Pressure',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? (
      <span className={`font-semibold ${(v as number) > 66 ? 'text-danger' : (v as number) > 33 ? 'text-warning' : 'text-success'}`}>
        {formatNumber(v as number, 0)}
      </span>
    ) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'localEconomyScore',
    label: 'Economy Score',
    sortable: true,
    align: 'right',
    render: (v) => v !== null && v !== undefined ? (
      <span className="font-bold text-accent">{formatNumber(v as number, 0)}</span>
    ) : <span className="unavailable-badge">N/A</span>,
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    sortable: false,
    render: (v) => v ? <span className="text-xs text-text-muted">{v as string}</span> : <span className="unavailable-badge">N/A</span>,
  },
];

export default function CountiesClient({ counties }: CountiesClientProps) {
  const rows = (counties ?? []) as unknown as CountyRow[];

  const csvData = rows.map(r => ({
    County: r.county,
    Population: r.population ?? '',
    'Median HH Income (USD)': r.medianHouseholdIncome ?? '',
    'Unemployment Rate (%)': r.unemploymentRate ?? '',
    'Population Growth (%)': r.populationGrowth ?? '',
    'Federal Spending Per Capita (USD)': r.federalSpendingPerCapita ?? '',
    'Housing Pressure Score': r.housingPressureScore ?? '',
    'Local Economy Score': r.localEconomyScore ?? '',
    'Last Updated': r.lastUpdated ?? '',
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DownloadCsvButton
          data={csvData}
          filename="colorado-counties-economic-data"
          label="Download CSV"
        />
      </div>
      <DataTable
        columns={COLUMNS}
        data={rows}
        caption="Colorado county economic data"
        searchable
        searchKeys={['county']}
        pageSize={25}
      />
    </div>
  );
}
