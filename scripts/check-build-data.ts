#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

type Metric = {
  value: number | null;
  sourceName?: string;
  sourceDataset?: string;
  unavailableReason?: string;
};

type SourceCount = {
  attempted: number;
  succeeded: number;
  failed: number;
  unavailable: number;
};

const processedDir = path.join(process.cwd(), 'data', 'processed');

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(processedDir, relativePath), 'utf8')) as T;
}

function assertMetricAvailable(file: string, label: string, metric: Metric | undefined, errors: string[]): void {
  if (!metric) {
    errors.push(`${file}: ${label} metric is missing.`);
    return;
  }
  if (metric.value === null) {
    errors.push(`${file}: ${label} resolved to null even though this build has source data. Reason: ${metric.unavailableReason ?? 'none'}`);
  }
  if (!metric.sourceName || !metric.sourceDataset) {
    errors.push(`${file}: ${label} is missing source metadata.`);
  }
}

const errors: string[] = [];

const metadata = readJson<{ sourceCounts?: Record<string, SourceCount> }>('metadata-catalog.json');
const sourceCounts = metadata.sourceCounts ?? {};
const requiredSources = ['FRED', 'Census', 'College Scorecard', 'USAspending', 'BEA'];

for (const source of requiredSources) {
  if ((sourceCounts[source]?.succeeded ?? 0) === 0) {
    errors.push(`metadata-catalog.json: ${source} has zero successful source fetches.`);
  }
}

const states = readJson<{ states: Array<{ slug: string; localEconomyScore: Metric }> }>('states.json');
const counties = readJson<{ counties: unknown[] }>('counties.json');
const metros = readJson<{ metros: unknown[] }>('metros.json');
const colorado = readJson<{
  unemploymentRate?: Metric;
  medianHouseholdIncome?: Metric;
  gdp?: Metric;
  population?: Metric;
  state?: { federalSpendingPerCapita?: Metric; localEconomyScore?: Metric };
}>('colorado-overview.json');

if (states.states.length < 50) errors.push(`states.json: expected at least 50 states, found ${states.states.length}.`);
if (counties.counties.length === 0) errors.push('counties.json: no county rows generated.');
if (metros.metros.length === 0) errors.push('metros.json: no metro rows generated.');

const coloradoState = states.states.find(state => state.slug === 'colorado');
assertMetricAvailable('states.json', 'Colorado local economy score', coloradoState?.localEconomyScore, errors);
assertMetricAvailable('colorado-overview.json', 'Colorado unemployment', colorado.unemploymentRate, errors);
assertMetricAvailable('colorado-overview.json', 'Colorado median household income', colorado.medianHouseholdIncome, errors);
assertMetricAvailable('colorado-overview.json', 'Colorado GDP', colorado.gdp, errors);
assertMetricAvailable('colorado-overview.json', 'Colorado population', colorado.population, errors);
assertMetricAvailable('colorado-overview.json', 'Colorado federal spending per capita', colorado.state?.federalSpendingPerCapita, errors);

if (errors.length > 0) {
  console.error(`Build data sanity check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log('Build data sanity check passed.');
