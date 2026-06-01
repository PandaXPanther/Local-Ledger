import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero, type HeroSourceCard, type HeroValidationItem } from '@/components/Hero';
import { KpiCard } from '@/components/KpiCard';
import { SourceBadge } from '@/components/SourceBadge';
import { LastUpdated } from '@/components/LastUpdated';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { CityComparisonTable } from '@/components/CityComparisonTable';
import { COLORADO_CITIES } from '@/lib/constants';
import { formatCurrency, formatDataValue, formatNumber } from '@/lib/format';
import Link from 'next/link';
import type { DataPoint } from '@/types/data';

export const metadata: Metadata = {
  title: 'Colorado Economic Overview',
  description: 'Official economic data for Colorado - unemployment, income, GDP, and population from FRED, BLS, and Census.',
};

interface OverviewData {
  _meta: {
    description: string;
    generatedAt: string;
    sources: Array<{ name: string; url: string; dataset: string }>;
  };
  unemploymentRate: DataPoint;
  medianHouseholdIncome: DataPoint;
  gdp: DataPoint;
  population: DataPoint;
  usUnemploymentRate: DataPoint;
  usMedianHouseholdIncome: DataPoint;
  state?: {
    federalSpendingPerCapita?: DataPoint;
  };
}

interface CityData {
  _meta: { generatedAt: string };
  denver: { city: string; unemploymentRate: DataPoint };
  boulder: { city: string; unemploymentRate: DataPoint };
  coloradoSprings: { city: string; unemploymentRate: DataPoint };
  fortCollins: { city: string; unemploymentRate: DataPoint };
  aurora: { city: string; unemploymentRate: DataPoint };
}

interface SourceCounts {
  [source: string]: {
    attempted: number;
    succeeded: number;
    failed: number;
    unavailable: number;
  };
}

interface MetadataCatalog {
  sourceCounts?: SourceCounts;
}

function loadOverview(): OverviewData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'colorado-overview.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function loadCities(): CityData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'cities.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function loadMetadataCatalog(): MetadataCatalog | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'metadata-catalog.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function statusForMetric(metric: DataPoint | null | undefined): 'pass' | 'warn' | 'fail' {
  if (!metric) return 'fail';
  return metric.value === null ? 'warn' : 'pass';
}

export default function ColoradoPage() {
  const overview = loadOverview();
  const cities = loadCities();
  const metadataCatalog = loadMetadataCatalog();
  const generatedAt = overview?._meta?.generatedAt ?? null;
  const sourceCounts = metadataCatalog?.sourceCounts ?? {};

  const sourceCards = [
    {
      label: 'FRED',
      value: overview?.unemploymentRate ? formatDataValue(overview.unemploymentRate.value, overview.unemploymentRate.unit) : 'Unavailable',
      detail: `${sourceCounts.FRED?.succeeded ?? 0} series fetched. Colorado unemployment ${overview?.unemploymentRate?.date ?? 'date unavailable'}.`,
      status: statusForMetric(overview?.unemploymentRate),
    },
    {
      label: 'Census',
      value: overview?.medianHouseholdIncome ? formatCurrency(overview.medianHouseholdIncome.value) : 'Unavailable',
      detail: `${sourceCounts.Census?.succeeded ?? 0} ACS queries fetched. Population ${formatNumber(overview?.population?.value ?? null)}.`,
      status: statusForMetric(overview?.medianHouseholdIncome),
    },
    {
      label: 'BEA',
      value: `${sourceCounts.BEA?.succeeded ?? 0} ok`,
      detail: 'Regional GDP source available for state account cross checks.',
      status: (sourceCounts.BEA?.succeeded ?? 0) > 0 ? 'pass' as const : 'warn' as const,
    },
    {
      label: 'USAspending',
      value: overview?.state?.federalSpendingPerCapita
        ? formatCurrency(overview.state.federalSpendingPerCapita.value)
        : 'Unavailable',
      detail: `Per resident in FY2024. ${sourceCounts.USAspending?.succeeded ?? 0} state calls fetched.`,
      status: statusForMetric(overview?.state?.federalSpendingPerCapita),
    },
  ] satisfies HeroSourceCard[];

  const validationItems = [
    {
      label: 'CO unemployment',
      shortLabel: 'Jobs',
      status: statusForMetric(overview?.unemploymentRate),
      detail: overview?.unemploymentRate?.sourceDataset ?? 'Missing FRED series metadata.',
    },
    {
      label: 'CO income',
      shortLabel: 'Income',
      status: statusForMetric(overview?.medianHouseholdIncome),
      detail: overview?.medianHouseholdIncome?.sourceDataset ?? 'Missing Census income metadata.',
    },
    {
      label: 'CO GDP',
      shortLabel: 'GDP',
      status: statusForMetric(overview?.gdp),
      detail: overview?.gdp?.sourceDataset ?? 'Missing GDP metadata.',
    },
    {
      label: 'CO population',
      shortLabel: 'People',
      status: statusForMetric(overview?.population),
      detail: overview?.population?.sourceDataset ?? 'Missing population metadata.',
    },
    {
      label: 'Federal spending',
      shortLabel: 'Federal',
      status: statusForMetric(overview?.state?.federalSpendingPerCapita),
      detail: overview?.state?.federalSpendingPerCapita?.sourceDataset ?? 'Missing USAspending metadata.',
    },
    {
      label: 'Pipeline report',
      shortLabel: 'Pipeline',
      status: Object.keys(sourceCounts).length > 0 ? 'pass' as const : 'fail' as const,
      detail: 'Source attempt counts are bundled in metadata-catalog.json.',
    },
  ] satisfies HeroValidationItem[];

  const cityRows = cities ? [
    { city: 'Denver', unemploymentRate: cities.denver?.unemploymentRate ?? null },
    { city: 'Boulder', unemploymentRate: cities.boulder?.unemploymentRate ?? null },
    { city: 'Colorado Springs', unemploymentRate: cities.coloradoSprings?.unemploymentRate ?? null },
    { city: 'Fort Collins', unemploymentRate: cities.fortCollins?.unemploymentRate ?? null },
    { city: 'Aurora', unemploymentRate: cities.aurora?.unemploymentRate ?? null },
  ] : [];

  return (
    <>
      <Hero
        tag="Colorado"
        headline="Colorado Economic Overview"
        subheadline="Statewide economic indicators from official federal sources - FRED, BLS, and Census Bureau."
        primaryCta={{ label: 'View Counties', href: '/colorado/counties/' }}
        secondaryCta={{ label: 'Recession Radar', href: '/colorado/recession-radar/' }}
        pulseTitle="Colorado pulse"
        pulseStatus="Live build data"
        sourceCards={sourceCards}
        validationItems={validationItems}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Data freshness notice */}
        {generatedAt && (
          <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <LastUpdated timestamp={generatedAt} label="Data pipeline run" />
          </div>
        )}

        {/* KPI grid */}
        <section aria-label="Key economic indicators">
          <h2 className="text-xl font-bold text-text-primary mb-4">Key Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Unemployment Rate"
              dataPoint={overview?.unemploymentRate ?? null}
              highlight
              comparison={
                overview?.usUnemploymentRate?.value !== null && overview?.usUnemploymentRate !== undefined
                  ? { label: 'US avg', value: overview.usUnemploymentRate.value, unit: 'percent' }
                  : undefined
              }
            />
            <KpiCard
              label="Median Household Income"
              dataPoint={overview?.medianHouseholdIncome ?? null}
              comparison={
                overview?.usMedianHouseholdIncome?.value !== null && overview?.usMedianHouseholdIncome !== undefined
                  ? { label: 'US avg', value: overview.usMedianHouseholdIncome.value, unit: 'USD' }
                  : undefined
              }
            />
            <KpiCard
              label="GDP"
              dataPoint={overview?.gdp ?? null}
            />
            <KpiCard
              label="Population"
              dataPoint={overview?.population ?? null}
            />
          </div>
        </section>

        {/* Chart placeholders - charts rendered client-side from data */}
        <section aria-label="Economic trend charts" className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Trend Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <p className="section-label mb-2">Unemployment vs. US</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Colorado unemployment rate vs. US national rate.
                {overview?.unemploymentRate?.value !== null && overview?.unemploymentRate !== undefined && (
                  <> Latest CO: <strong>{overview.unemploymentRate.value}%</strong></>
                )}
                {overview?.usUnemploymentRate?.value !== null && overview?.usUnemploymentRate !== undefined && (
                  <>, US: <strong>{overview.usUnemploymentRate.value}%</strong></>
                )}
              </p>
              <div className="source-strip">
                <SourceBadge
                  name="FRED"
                  url="https://fred.stlouisfed.org/series/COURN"
                  dataset="COURN, UNRATE"
                />
              </div>
            </div>
            <div className="card p-6">
              <p className="section-label mb-2">Median Income</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Colorado median household income vs. US.
                {overview?.medianHouseholdIncome?.value !== null && overview?.medianHouseholdIncome !== undefined && (
                  <> Latest CO: <strong>${overview.medianHouseholdIncome.value?.toLocaleString()}</strong></>
                )}
              </p>
              <div className="source-strip">
                <SourceBadge
                  name="FRED"
                  url="https://fred.stlouisfed.org/series/MEHOINUSCOA646N"
                  dataset="MEHOINUSCOA646N"
                />
              </div>
            </div>
            <div className="card p-6">
              <p className="section-label mb-2">State GDP</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Colorado real GDP (millions USD).
                {overview?.gdp?.value !== null && overview?.gdp !== undefined && (
                  <> Latest: <strong>${overview.gdp.value?.toLocaleString()}M</strong></>
                )}
              </p>
              <div className="source-strip">
                <SourceBadge
                  name="FRED"
                  url="https://fred.stlouisfed.org/series/CORGSP"
                  dataset="CORGSP"
                />
              </div>
            </div>
          </div>
        </section>

        {/* City comparison */}
        <section aria-label="City comparison" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-text-primary">City Comparison</h2>
            <div className="flex gap-2">
              {COLORADO_CITIES.map(c => (
                <Link key={c.href} href={c.href} className="text-xs text-brand-blue hover:underline">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <CityComparisonTable
            cities={cityRows}
            stateAvg={{
              unemploymentRate: overview?.unemploymentRate?.value ?? null,
              medianHouseholdIncome: overview?.medianHouseholdIncome?.value ?? null,
            }}
          />
          <p className="text-xs text-text-muted mt-2">
            City unemployment data uses MSA (Metropolitan Statistical Area) series from FRED where available.
            Aurora uses Denver MSA as closest proxy. Individual city-level annual data available from ACS.
          </p>
        </section>

        {/* Methodology note */}
        <MethodologyCallout
          type="info"
          title="About this data"
          note="All indicators are sourced from official federal databases. FRED series are latest available observations. City-level data uses MSA boundaries. Unavailable values reflect missing API credentials or no published series - never estimated or fabricated."
        />

        {/* Source strip */}
        <div className="mt-6 source-strip flex-wrap gap-3">
          <SourceBadge
            name="Federal Reserve Economic Data (FRED)"
            url="https://fred.stlouisfed.org/"
            dataset="Multiple series"
          />
          {generatedAt && <LastUpdated timestamp={generatedAt} />}
        </div>
      </div>
    </>
  );
}
