import type { CitySnapshot } from '@/lib/loadCityData';
import { KpiCard } from './KpiCard';
import { SourceBadge } from './SourceBadge';
import { LastUpdated } from './LastUpdated';
import { MethodologyCallout } from './MethodologyCallout';
import { formatPercent } from '@/lib/format';

interface CityDashboardProps {
  snapshot: CitySnapshot;
  description?: string;
}

export function CityDashboard({ snapshot, description }: CityDashboardProps) {
  const { city, unemploymentRate, coloradoUnemploymentRate, usUnemploymentRate, population, medianHouseholdIncome, medianHomeValue, medianRent, generatedAt } = snapshot;

  const coVal = coloradoUnemploymentRate?.value;
  const usVal = usUnemploymentRate?.value;
  const cityVal = unemploymentRate?.value;

  const comparisonRows = [
    { label: `${city} metro proxy`, value: cityVal, highlight: true },
    { label: 'Colorado', value: coVal, highlight: false },
    { label: 'United States', value: usVal, highlight: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {description && (
        <p className="text-text-secondary mb-6 max-w-2xl">{description}</p>
      )}

      {generatedAt && (
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <LastUpdated timestamp={generatedAt} label="Data pipeline run" />
        </div>
      )}

      {/* KPIs */}
      <section aria-label={`${city} key indicators`} className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Key Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label={`Metro-area unemployment (proxy for ${city})`}
            dataPoint={unemploymentRate}
            highlight
            comparison={coVal !== null && coVal !== undefined ? { label: 'CO avg', value: coVal, unit: 'percent' } : undefined}
          />
          <KpiCard label="Population" dataPoint={population} />
          <KpiCard label="Median household income" dataPoint={medianHouseholdIncome} />
          <KpiCard label="Median home value" dataPoint={medianHomeValue} />
          <KpiCard label="Median rent" dataPoint={medianRent} />
        </div>
      </section>

      {/* Unemployment comparison */}
      <section aria-label="Unemployment rate comparison" className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Unemployment Rate - Metro Proxy vs. State vs. US</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm" aria-label="Unemployment rate comparison">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Geography</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Unemployment Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map(row => (
                <tr key={row.label} className={row.highlight ? 'bg-blue-50/40' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-3 font-medium ${row.highlight ? 'text-brand-blue' : 'text-text-primary'}`}>
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {row.value !== null && row.value !== undefined
                      ? formatPercent(row.value)
                      : <span className="unavailable-badge">Data unavailable</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">FRED</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-border">
            <SourceBadge
              name="Federal Reserve Economic Data (FRED)"
              url="https://fred.stlouisfed.org/"
              dataset={unemploymentRate?.sourceDataset ?? 'Metropolitan Statistical Area unemployment series'}
            />
          </div>
        </div>
      </section>

      <MethodologyCallout
        type="disclaimer"
        title="Data notes"
        note={`${city} unemployment data uses the Metropolitan Statistical Area series from FRED where available, sourced from BLS LAUS, which may include surrounding counties. Population, income, home value, and rent use Census ACS place data.`}
      />

      <div className="mt-6 source-strip flex-wrap gap-3">
        <SourceBadge
          name="Federal Reserve Economic Data (FRED)"
          url="https://fred.stlouisfed.org/"
          dataset={unemploymentRate?.sourceDataset ?? 'MSA unemployment series'}
        />
        <SourceBadge
          name="U.S. Census Bureau"
          url={medianHouseholdIncome?.sourceUrl ?? 'https://api.census.gov/data/2024/acs/acs5'}
          dataset={medianHouseholdIncome?.sourceDataset ?? 'ACS place data'}
        />
        {generatedAt && <LastUpdated timestamp={generatedAt} />}
      </div>
    </div>
  );
}
