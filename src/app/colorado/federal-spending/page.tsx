import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero } from '@/components/Hero';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { SourceBadge } from '@/components/SourceBadge';
import { LastUpdated } from '@/components/LastUpdated';
import { formatCurrency, formatShortNumber } from '@/lib/format';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Federal Spending in Colorado',
  description: 'Federal grants, contracts, and loans in Colorado by agency, county, and recipient - USAspending.gov data.',
  path: '/colorado/federal-spending/',
});

interface FederalData {
  _meta: {
    description: string;
    generatedAt: string;
    source: { name: string; url: string; dataset: string; lastFetchedAt: string };
  };
  stateTotal: unknown;
}

function loadFederalData(): FederalData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'federal-spending.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

export default function FederalSpendingPage() {
  const data = loadFederalData();
  const generatedAt = data?._meta?.generatedAt ?? null;

  const stateResults = Array.isArray(data?.stateTotal) ? data.stateTotal as Record<string, unknown>[] : [];
  const hasData = stateResults.length > 0;

  // Extract Colorado total if available
  const coRecord = stateResults.find((r) => r['shape_code'] === 'CO' || r['display_name'] === 'Colorado');
  const coTotal = coRecord?.['aggregated_amount'] as number | null ?? null;
  const coPopulation = 5839926; // 2023 Census estimate
  const perCapita = coTotal && coTotal > 0 ? Math.round(coTotal / coPopulation) : null;

  return (
    <>
      <Hero
        tag="Colorado · Federal Spending"
        headline="Federal Spending in Colorado"
        subheadline="Grants, contracts, loans, and direct payments flowing into Colorado from federal agencies - USAspending.gov."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {generatedAt && (
          <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
            <LastUpdated timestamp={generatedAt} label="Data pipeline run" />
          </div>
        )}

        {/* Summary KPIs */}
        <section aria-label="Federal spending summary" className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">FY2023 Federal Awards - Colorado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="kpi-card">
              <span className="section-label">Total Federal Awards</span>
              <div className={`text-3xl font-bold mt-2 ${coTotal === null ? 'text-text-muted' : 'text-text-primary'}`}>
                {coTotal !== null ? formatShortNumber(coTotal) : 'Data unavailable'}
              </div>
              <p className="text-xs text-text-muted mt-1">FY2023 (Oct 2023 - Sep 2024)</p>
              <div className="mt-3">
                <SourceBadge name="USAspending.gov" url="https://www.usaspending.gov/" dataset="Federal Award Spending" />
              </div>
            </div>
            <div className="kpi-card">
              <span className="section-label">Per Capita (est.)</span>
              <div className={`text-3xl font-bold mt-2 ${perCapita === null ? 'text-text-muted' : 'text-text-primary'}`}>
                {perCapita !== null ? formatCurrency(perCapita) : 'Data unavailable'}
              </div>
              <p className="text-xs text-text-muted mt-1">Based on 2023 Census population estimate</p>
              <div className="mt-3">
                <SourceBadge name="USAspending.gov" url="https://www.usaspending.gov/" dataset="Federal Award Data" />
              </div>
            </div>
            <div className="kpi-card">
              <span className="section-label">Award Categories</span>
              <div className="text-sm font-medium mt-2 space-y-1 text-text-secondary">
                <div>• Grants</div>
                <div>• Contracts</div>
                <div>• Loans</div>
                <div>• Direct payments</div>
              </div>
              <div className="mt-3">
                <SourceBadge name="USAspending.gov" url="https://www.usaspending.gov/" dataset="Award Type Breakdown" />
              </div>
            </div>
          </div>
        </section>

        {/* Data state notice */}
        {!hasData && (
          <div className="mb-8">
            <MethodologyCallout
              type="warning"
              title="Detailed spending data"
              note="State-level total not returned from USAspending API in this pipeline run. USAspending.gov does not require an API key - data fetch may have timed out. Re-run pnpm data:fetch for a retry. Detailed agency and county breakdowns require additional API calls."
            />
          </div>
        )}

        {/* Award type breakdown */}
        <section aria-label="Award type breakdown" className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Award Types</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm" aria-label="Federal spending by award type">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Award Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">Per Capita</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {['Grants', 'Contracts', 'Loans', 'Direct Payments', 'Other'].map(type => (
                  <tr key={type} className="hover:bg-accent-soft">
                    <td className="px-4 py-3 font-medium">{type}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="unavailable-badge">Data unavailable</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="unavailable-badge">Data unavailable</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">USAspending.gov</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-canvas border-t border-border text-xs text-text-muted">
              Detailed breakdown requires additional USAspending API queries by award type.
              Re-run data:fetch with network access to populate.
            </div>
          </div>
        </section>

        <MethodologyCallout
          type="info"
          title="About federal spending data"
          note="Federal award data is from USAspending.gov, the official source for federal spending information. Data covers grants, contracts, loans, and direct payments with Colorado as place of performance. Per-capita calculations use Census Bureau 2023 population estimates. Year-over-year comparisons will be added in future releases."
        />

        <div className="mt-6 source-strip flex-wrap gap-3">
          <SourceBadge
            name="USAspending.gov"
            url="https://www.usaspending.gov/"
            dataset="USAspending API v2 - Spending by Geography"
          />
          {generatedAt && <LastUpdated timestamp={generatedAt} />}
        </div>
      </div>
    </>
  );
}
