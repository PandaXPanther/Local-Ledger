#!/usr/bin/env tsx
/**
 * LocalLedger Data Fetch Script
 * Pulls only official public data from FRED, BLS, Census, BEA, College Scorecard, USAspending.
 * All network calls are graceful-fail: missing API keys → write "unavailable" stubs with proper provenance.
 * NEVER fabricates, estimates, or invents data values.
 */

import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');
const METADATA_DIR = path.join(process.cwd(), 'data', 'metadata');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public', 'data', 'processed');

for (const dir of [RAW_DIR, PROCESSED_DIR, METADATA_DIR, PUBLIC_DATA_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const NOW = new Date().toISOString();

const FRED_API_KEY = process.env.FRED_API_KEY ?? '';
const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? '';

function makeUnavailable(
  geography: string,
  sourceName: string,
  sourceUrl: string,
  sourceDataset: string,
  unit: string,
  seriesId?: string
) {
  return {
    value: null,
    unit,
    geography,
    date: 'unavailable',
    sourceName,
    sourceUrl,
    sourceDataset,
    sourceSeriesId: seriesId,
    lastFetchedAt: NOW,
    transformation: 'none',
    methodologyNote: 'Data could not be fetched; API key may be missing or service unavailable.',
  };
}

async function fetchFred(seriesId: string, geography: string, unit: string, label: string) {
  if (!FRED_API_KEY) {
    console.warn(`[FRED] No API key - skipping ${seriesId}`);
    return makeUnavailable(
      geography,
      'Federal Reserve Economic Data (FRED)',
      `https://fred.stlouisfed.org/series/${seriesId}`,
      `FRED Series ${seriesId}`,
      unit,
      seriesId
    );
  }
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { observations?: Array<{ date: string; value: string }> };
    const obs = json.observations?.[0];
    if (!obs || obs.value === '.') {
      return makeUnavailable(
        geography,
        'Federal Reserve Economic Data (FRED)',
        `https://fred.stlouisfed.org/series/${seriesId}`,
        `FRED Series ${seriesId}`,
        unit,
        seriesId
      );
    }
    const val = parseFloat(obs.value);
    console.log(`[FRED] ${label} (${seriesId}): ${val} ${unit} on ${obs.date}`);
    return {
      value: isFinite(val) ? val : null,
      unit,
      geography,
      date: obs.date,
      sourceName: 'Federal Reserve Economic Data (FRED)',
      sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
      sourceDataset: `FRED Series ${seriesId}`,
      sourceSeriesId: seriesId,
      lastFetchedAt: NOW,
      transformation: 'latest observation',
      methodologyNote: `Latest available observation for FRED series ${seriesId}.`,
    };
  } catch (err) {
    console.warn(`[FRED] Error fetching ${seriesId}:`, err);
    return makeUnavailable(
      geography,
      'Federal Reserve Economic Data (FRED)',
      `https://fred.stlouisfed.org/series/${seriesId}`,
      `FRED Series ${seriesId}`,
      unit,
      seriesId
    );
  }
}

async function fetchCollegeScorecard(state = 'CO', perPage = 20) {
  const COLLEGE_API_KEY = process.env.COLLEGE_SCORECARD_API_KEY ?? '';
  if (!COLLEGE_API_KEY) {
    console.warn('[CollegeScorecard] No API key - using stub');
    return [];
  }
  try {
    const fields = [
      'id', 'school.name', 'school.city', 'school.state', 'school.ownership',
      'latest.cost.avg_net_price.public',
      'latest.cost.avg_net_price.private',
      'latest.completion.rate_suppressed.overall',
      'latest.earnings.10_yrs_after_entry.median',
      'latest.aid.median_debt.completers.overall',
    ].join(',');
    const url = `https://api.data.gov/ed/collegescorecard/v1/schools?school.state=${state}&fields=${fields}&per_page=${perPage}&api_key=${COLLEGE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { results?: Record<string, unknown>[] };
    return json.results ?? [];
  } catch (err) {
    console.warn('[CollegeScorecard] Error:', err);
    return [];
  }
}

async function fetchUSASpending(state = 'CO', fiscalYear = 2023) {
  try {
    const url = `https://api.usaspending.gov/api/v2/search/spending_by_geography/`;
    const body = {
      scope: 'place_of_performance',
      geo_layer: 'state',
      geo_layer_filters: ['CO'],
      filters: {
        time_period: [{ start_date: `${fiscalYear}-10-01`, end_date: `${fiscalYear + 1}-09-30` }],
      },
      subawards: false,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { results?: unknown[] };
    console.log(`[USASpending] State summary fetched (${json.results?.length ?? 0} rows)`);
    return json.results ?? [];
  } catch (err) {
    console.warn('[USASpending] Error:', err);
    return [];
  }
}

async function fetchUSASpendingByAgency(fiscalYear = 2023) {
  try {
    const url = `https://api.usaspending.gov/api/v2/search/spending_by_award_count/`;
    const body = {
      filters: {
        place_of_performance_locations: [{ country: 'USA', state: 'CO' }],
        time_period: [{ start_date: `${fiscalYear}-10-01`, end_date: `${fiscalYear + 1}-09-30` }],
      },
      subawards: false,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as Record<string, unknown>;
    return json;
  } catch (err) {
    console.warn('[USASpending] Agency breakdown error:', err);
    return {};
  }
}

// ─── FRED Series IDs for Colorado ──────────────────────────────────────────
const FRED_SERIES: Array<{
  id: string;
  label: string;
  geography: string;
  unit: string;
  key: string;
}> = [
  // State-level
  { id: 'COURN', label: 'Colorado Unemployment Rate', geography: 'Colorado', unit: 'percent', key: 'co_unemployment' },
  { id: 'MEHOINUSCOA646N', label: 'Colorado Median Household Income', geography: 'Colorado', unit: 'USD', key: 'co_median_income' },
  { id: 'CORGSP', label: 'Colorado GDP', geography: 'Colorado', unit: 'USD millions', key: 'co_gdp' },
  { id: 'COPOP', label: 'Colorado Population', geography: 'Colorado', unit: 'persons (thousands)', key: 'co_population' },
  // Denver MSA
  { id: 'DENV708URN', label: 'Denver Unemployment Rate', geography: 'Denver-Aurora-Lakewood, CO MSA', unit: 'percent', key: 'denver_unemployment' },
  // Boulder MSA
  { id: 'BOUL708URN', label: 'Boulder Unemployment Rate', geography: 'Boulder, CO MSA', unit: 'percent', key: 'boulder_unemployment' },
  // Colorado Springs MSA
  { id: 'COLO708URN', label: 'Colorado Springs Unemployment Rate', geography: 'Colorado Springs, CO MSA', unit: 'percent', key: 'cos_unemployment' },
  // Fort Collins MSA
  { id: 'FTCO708URN', label: 'Fort Collins Unemployment Rate', geography: 'Fort Collins, CO MSA', unit: 'percent', key: 'ftc_unemployment' },
  // US baseline
  { id: 'UNRATE', label: 'US Unemployment Rate', geography: 'United States', unit: 'percent', key: 'us_unemployment' },
  { id: 'MEHOINUSA672N', label: 'US Median Household Income', geography: 'United States', unit: 'USD', key: 'us_median_income' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataRecord = Record<string, any>;

async function main() {
  console.log('=== LocalLedger Data Fetch ===');
  console.log(`Timestamp: ${NOW}`);
  console.log(`FRED API Key: ${FRED_API_KEY ? 'present' : 'missing (will use unavailable stubs)'}`);
  console.log(`Census API Key: ${CENSUS_API_KEY ? 'present' : 'missing'}`);

  // 1. Fetch FRED series
  const fredData: DataRecord = {};
  for (const series of FRED_SERIES) {
    fredData[series.key] = await fetchFred(series.id, series.geography, series.unit, series.label);
    await new Promise(r => setTimeout(r, 150)); // rate limit
  }

  // Save raw FRED
  fs.writeFileSync(
    path.join(RAW_DIR, 'fred.json'),
    JSON.stringify({ fetchedAt: NOW, data: fredData }, null, 2)
  );

  // 2. Process Colorado overview
  const coloradoOverview = {
    _meta: {
      description: 'Colorado statewide economic overview',
      generatedAt: NOW,
      sources: [
        {
          name: 'Federal Reserve Economic Data (FRED)',
          url: 'https://fred.stlouisfed.org/',
          dataset: 'Multiple series',
        },
      ],
    },
    unemploymentRate: fredData['co_unemployment'],
    medianHouseholdIncome: fredData['co_median_income'],
    gdp: fredData['co_gdp'],
    population: fredData['co_population'],
    usUnemploymentRate: fredData['us_unemployment'],
    usMedianHouseholdIncome: fredData['us_median_income'],
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'colorado-overview.json'),
    JSON.stringify(coloradoOverview, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'colorado-overview.json'),
    JSON.stringify(coloradoOverview, null, 2)
  );

  // 3. City data
  const cityData = {
    _meta: {
      description: 'Colorado city economic data (MSA-level where available)',
      generatedAt: NOW,
      sources: [
        { name: 'Federal Reserve Economic Data (FRED)', url: 'https://fred.stlouisfed.org/' },
      ],
    },
    denver: {
      city: 'Denver',
      state: 'Colorado',
      unemploymentRate: fredData['denver_unemployment'],
    },
    boulder: {
      city: 'Boulder',
      state: 'Colorado',
      unemploymentRate: fredData['boulder_unemployment'],
    },
    coloradoSprings: {
      city: 'Colorado Springs',
      state: 'Colorado',
      unemploymentRate: fredData['cos_unemployment'],
    },
    fortCollins: {
      city: 'Fort Collins',
      state: 'Colorado',
      unemploymentRate: fredData['ftc_unemployment'],
    },
    aurora: {
      city: 'Aurora',
      state: 'Colorado',
      unemploymentRate: makeUnavailable(
        'Aurora, CO',
        'Federal Reserve Economic Data (FRED)',
        'https://fred.stlouisfed.org/',
        'FRED - MSA series not separately available for Aurora',
        'percent'
      ),
    },
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'cities.json'),
    JSON.stringify(cityData, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'cities.json'),
    JSON.stringify(cityData, null, 2)
  );

  // 4. College Scorecard
  const colleges = await fetchCollegeScorecard('CO', 50);
  const collegeData = {
    _meta: {
      description: 'Colorado college ROI data from College Scorecard',
      generatedAt: NOW,
      source: {
        name: 'College Scorecard (U.S. Dept. of Education)',
        url: 'https://collegescorecard.ed.gov/',
        dataset: 'College Scorecard API v1',
        lastFetchedAt: NOW,
      },
      disclaimer:
        'College ROI metrics are simplified indicators based on public data. They should not be treated as a complete measure of educational quality, fit, or long-term outcomes.',
    },
    colleges: colleges.length > 0 ? colleges : 'unavailable',
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'colleges.json'),
    JSON.stringify(collegeData, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'colleges.json'),
    JSON.stringify(collegeData, null, 2)
  );

  // 5. Federal spending (USASpending - no key required)
  const federalSpending = await fetchUSASpending('CO', 2023);
  const federalData = {
    _meta: {
      description: 'Federal award spending in Colorado FY2023',
      generatedAt: NOW,
      source: {
        name: 'USAspending.gov',
        url: 'https://www.usaspending.gov/',
        dataset: 'USAspending API v2',
        lastFetchedAt: NOW,
      },
    },
    stateTotal: federalSpending,
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'federal-spending.json'),
    JSON.stringify(federalData, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'federal-spending.json'),
    JSON.stringify(federalData, null, 2)
  );

  // 6. Recession indicator (derived from FRED data with transparent rules)
  const coUnempVal = fredData['co_unemployment']?.value ?? null;
  const usUnempVal = fredData['us_unemployment']?.value ?? null;

  let riskScore = 0;
  const riskComponents = {
    unemploymentTrend: 'stable' as 'rising' | 'stable' | 'falling',
    housingActivity: 'stable' as 'contracting' | 'stable' | 'expanding',
    laborMarket: 'stable' as 'weakening' | 'stable' | 'strengthening',
  };

  if (coUnempVal !== null && usUnempVal !== null) {
    // CO above national = slight risk signal
    if (coUnempVal > usUnempVal + 0.5) {
      riskScore += 30;
      riskComponents.unemploymentTrend = 'rising';
      riskComponents.laborMarket = 'weakening';
    } else if (coUnempVal < usUnempVal - 0.5) {
      riskScore = Math.max(0, riskScore - 10);
      riskComponents.unemploymentTrend = 'falling';
      riskComponents.laborMarket = 'strengthening';
    } else {
      riskScore += 15;
    }
  } else {
    riskScore = 0; // Cannot compute without data
  }

  const riskLevel: 'low' | 'moderate' | 'elevated' =
    riskScore < 34 ? 'low' : riskScore < 67 ? 'moderate' : 'elevated';

  const recessionIndicator = {
    _meta: {
      description: 'Colorado Slowdown Risk Indicator',
      generatedAt: NOW,
      disclaimer:
        'This indicator is an educational model based on public historical data. It is not financial advice, investment advice, or a guaranteed forecast.',
    },
    overall: riskLevel,
    score: riskScore,
    components: riskComponents,
    lastUpdated: NOW,
    methodologyNote:
      'Slowdown Risk Score (0-100): derived from CO vs. US unemployment differential, using FRED data. Score < 34 = Low, 34-66 = Moderate, 67+ = Elevated. Additional indicators (housing permits, consumer confidence) will be incorporated as data sources are confirmed.',
    sources: [
      {
        name: 'Federal Reserve Economic Data (FRED)',
        url: 'https://fred.stlouisfed.org/',
        dataset: 'COURN, UNRATE',
      },
    ],
    dataQualityNote:
      coUnempVal === null || usUnempVal === null
        ? 'Insufficient data to compute score. FRED API key required.'
        : 'Score computed from latest available FRED observations.',
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'recession-indicator.json'),
    JSON.stringify(recessionIndicator, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'recession-indicator.json'),
    JSON.stringify(recessionIndicator, null, 2)
  );

  // 7. Counties stub (Census data requires API key + complex ACS query)
  const countiesStub = {
    _meta: {
      description: 'Colorado county economic data',
      generatedAt: NOW,
      note: 'Full county data requires Census API key. Run data:fetch with CENSUS_API_KEY set.',
      source: {
        name: 'U.S. Census Bureau (American Community Survey)',
        url: 'https://data.census.gov/',
        dataset: 'ACS 5-Year Estimates',
        lastFetchedAt: NOW,
      },
    },
    counties: 'Data unavailable. Census county pipeline is not implemented yet.',
  };

  fs.writeFileSync(
    path.join(PROCESSED_DIR, 'counties.json'),
    JSON.stringify(countiesStub, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'counties.json'),
    JSON.stringify(countiesStub, null, 2)
  );

  // 8. Write metadata catalog
  const metadata = {
    generatedAt: NOW,
    datasets: [
      {
        id: 'colorado-overview',
        name: 'Colorado Economic Overview',
        source: 'FRED',
        file: '/data/processed/colorado-overview.json',
        lastFetchedAt: NOW,
      },
      {
        id: 'cities',
        name: 'Colorado City Data',
        source: 'FRED',
        file: '/data/processed/cities.json',
        lastFetchedAt: NOW,
      },
      {
        id: 'colleges',
        name: 'Colorado College ROI',
        source: 'College Scorecard',
        file: '/data/processed/colleges.json',
        lastFetchedAt: NOW,
      },
      {
        id: 'federal-spending',
        name: 'Federal Spending in Colorado',
        source: 'USAspending.gov',
        file: '/data/processed/federal-spending.json',
        lastFetchedAt: NOW,
      },
      {
        id: 'recession-indicator',
        name: 'Colorado Slowdown Risk Indicator',
        source: 'FRED',
        file: '/data/processed/recession-indicator.json',
        lastFetchedAt: NOW,
      },
      {
        id: 'counties',
        name: 'Colorado County Data',
        source: 'Census ACS',
        file: '/data/processed/counties.json',
        lastFetchedAt: NOW,
      },
    ],
  };

  fs.writeFileSync(
    path.join(METADATA_DIR, 'catalog.json'),
    JSON.stringify(metadata, null, 2)
  );
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'metadata-catalog.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n✅ Data fetch complete.');
  console.log('Files written to data/processed/ and public/data/processed/');
}

main().catch(err => {
  console.error('Fatal error in data fetch:', err);
  process.exit(1);
});
