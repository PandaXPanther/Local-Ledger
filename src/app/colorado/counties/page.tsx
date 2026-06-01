import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero } from '@/components/Hero';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { SourceBadge } from '@/components/SourceBadge';
import { LastUpdated } from '@/components/LastUpdated';
import CountiesClient from './CountiesClient';

export const metadata: Metadata = {
  title: 'Colorado Counties - Economic Data',
  description: 'Searchable, sortable economic data for all 64 Colorado counties - population, income, unemployment, housing, and federal spending.',
};

interface CountiesData {
  _meta: {
    description: string;
    generatedAt: string;
    note?: string;
    source?: { name: string; url: string; dataset: string; lastFetchedAt: string };
  };
  counties: unknown;
}

function loadCounties(): CountiesData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'counties.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

export default function CountiesPage() {
  const data = loadCounties();
  const generatedAt = data?._meta?.generatedAt ?? null;
  const countiesVal = data?.counties;
  const isAvailable = typeof countiesVal === 'object' && countiesVal !== null && !String(countiesVal).startsWith('Data unavailable') && String(countiesVal) !== 'unavailable';

  return (
    <>
      <Hero
        tag="Colorado · All 64 Counties"
        headline="Colorado County Economic Data"
        subheadline="Population, income, unemployment, housing, and federal spending for every Colorado county."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {generatedAt && (
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <LastUpdated timestamp={generatedAt} label="Data pipeline run" />
          </div>
        )}

        {!isAvailable && (
          <MethodologyCallout
            type="warning"
            title="Census data not yet loaded"
            note={
              typeof data?.counties === 'string'
                ? data.counties
                : 'County data requires a Census API key. Set the CENSUS_API_KEY environment variable and re-run pnpm data:fetch to populate this table. All 64 Colorado counties will be included once data is fetched.'
            }
          />
        )}

        {data?._meta?.note && (
          <div className="mb-6">
            <MethodologyCallout type="info" note={data._meta.note} />
          </div>
        )}

        {/* Table columns spec */}
        <section aria-label="County data table" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-text-primary">All 64 Colorado Counties</h2>
          </div>

          {isAvailable ? (
            <CountiesClient counties={data?.counties as Record<string, unknown>[]} />
          ) : (
            <div className="card p-8 text-center">
              <p className="text-text-muted text-sm mb-4">
                County data not yet available. The table will display:
              </p>
              <div className="inline-block text-left">
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• County name</li>
                  <li>• Population (Census)</li>
                  <li>• Median household income (ACS)</li>
                  <li>• Unemployment rate (BLS/FRED)</li>
                  <li>• Population growth (Census)</li>
                  <li>• Federal spending per capita (USAspending)</li>
                  <li>• Housing pressure score</li>
                  <li>• Local economy score</li>
                  <li>• Last updated</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        <MethodologyCallout
          type="info"
          title="Methodology notes"
          note="Housing pressure score: ratio of median home value to median household income, normalized 0-100 (higher = more pressure). Local Economy Score: weighted composite of labor, income, affordability, population growth, and fiscal indicators. See /methodology/ for full details."
        />

        <div className="mt-6 source-strip flex-wrap gap-3">
          <SourceBadge
            name="U.S. Census Bureau (ACS 5-Year Estimates)"
            url="https://data.census.gov/"
            dataset="American Community Survey"
          />
          <SourceBadge
            name="USAspending.gov"
            url="https://www.usaspending.gov/"
            dataset="Federal Award Data"
          />
          {generatedAt && <LastUpdated timestamp={generatedAt} />}
        </div>
      </div>
    </>
  );
}
