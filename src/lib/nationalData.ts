import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface Metric {
  value: number | null;
  unit: string;
  geography: string;
  date: string;
  sourceName: string;
  sourceUrl: string;
  sourceDataset: string;
  lastFetchedAt: string;
  availability?: 'available' | 'unavailable';
  unavailableReason?: string;
}

export interface StateRecord {
  slug: string;
  name: string;
  abbreviation: string;
  fips: string;
  population: Metric;
  medianHouseholdIncome: Metric;
  medianHomeValue: Metric;
  unemploymentRate: Metric;
  gdp: Metric;
  federalSpendingPerCapita: Metric;
  localEconomyScore: Metric;
}

export interface CountySummary {
  slug: string;
  county: string;
  state: string;
  stateSlug: string;
  stateAbbreviation: string;
  fips: string;
  population: number | null;
  medianHouseholdIncome: number | null;
  medianHomeValue: number | null;
  localEconomyScore: number | null;
  source: string;
  lastFetchedAt: string;
}

export interface CollegeSummary {
  unitId: string;
  name: string;
  city: string;
  state: string;
  stateSlug: string;
  stateAbbreviation: string;
  type: string;
  netPrice: number | null;
  graduationRate: number | null;
  medianEarnings: number | null;
  medianDebt: number | null;
  debtToEarningsRatio: number | null;
  valueScore: number | null;
  source: string;
  lastFetchedAt: string;
}

export interface FederalStateSummary {
  state: string;
  stateSlug: string;
  stateAbbreviation: string;
  fiscalYear: number;
  total: number | null;
  perCapita: number | null;
  source: string;
}

export interface MetroSummary {
  slug: string;
  name: string;
  state: string;
  stateSlug: string;
  population: number | null;
  medianHouseholdIncome: number | null;
  medianHomeValue: number | null;
  source: string;
  lastFetchedAt: string;
}

function readJson<T>(relativePath: string, fallback: T): T {
  const candidates = [
    join(process.cwd(), 'data', 'processed', relativePath),
    join(process.cwd(), 'public', 'data', 'processed', relativePath),
  ];
  const file = candidates.find(existsSync);
  if (!file) return fallback;
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}

export function getStates(): StateRecord[] {
  return readJson<{ states: StateRecord[] }>('states.json', { states: [] }).states;
}

export function getState(slug: string): StateRecord | null {
  return getStates().find(state => state.slug === slug) ?? null;
}

export function getStateBundle(slug: string) {
  return readJson<{
    state: StateRecord | null;
    counties: CountySummary[];
    colleges: CollegeSummary[];
    federalSpending: FederalStateSummary[];
    recessionRadar: { overall: string; score: number | null; methodologyNote: string; sources: string[] };
  }>(`states/${slug}.json`, {
    state: null,
    counties: [],
    colleges: [],
    federalSpending: [],
    recessionRadar: { overall: 'unavailable', score: null, methodologyNote: 'No state bundle generated.', sources: [] },
  });
}

export function getCounties(): CountySummary[] {
  return readJson<{ counties: CountySummary[] }>('counties.json', { counties: [] }).counties;
}

export function getCounty(stateSlug: string, countySlug: string): CountySummary | null {
  return getCounties().find(county => county.stateSlug === stateSlug && county.slug === countySlug) ?? null;
}

export function getColleges(): CollegeSummary[] {
  return readJson<{ colleges: CollegeSummary[] }>('colleges.json', { colleges: [] }).colleges;
}

export function getFederalSpending(): FederalStateSummary[] {
  return readJson<{ states: FederalStateSummary[] }>('federal-spending.json', { states: [] }).states;
}

export function getMetros(): MetroSummary[] {
  return readJson<{ metros: MetroSummary[] }>('metros.json', { metros: [] }).metros;
}

export function getMetro(slug: string): MetroSummary | null {
  return getMetros().find(metro => metro.slug === slug) ?? null;
}

export function formatMetric(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Data unavailable';
  if (unit === 'percent') return `${value.toFixed(1)}%`;
  if (unit?.includes('USD') || unit === 'USD' || unit === 'USD per person') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  if (unit === 'score') return value.toFixed(1);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function topBy<T>(items: T[], pick: (item: T) => number | null | undefined, count = 10): T[] {
  return [...items]
    .filter(item => {
      const value = pick(item);
      return value !== null && value !== undefined && Number.isFinite(value);
    })
    .sort((a, b) => (pick(b) ?? -Infinity) - (pick(a) ?? -Infinity))
    .slice(0, count);
}
