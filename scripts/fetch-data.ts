import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'data', 'processed');
const STATE_DIR = path.join(PROCESSED_DIR, 'states');
const PUBLIC_STATE_DIR = path.join(PUBLIC_DIR, 'states');

for (const dir of [RAW_DIR, PROCESSED_DIR, PUBLIC_DIR, STATE_DIR, PUBLIC_STATE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const NOW = new Date().toISOString();
const FRED_API_KEY = process.env.FRED_API_KEY ?? '';
const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? '';
const COLLEGE_SCORECARD_API_KEY = process.env.COLLEGE_SCORECARD_API_KEY ?? '';
const BEA_API_KEY = process.env.BEA_API_KEY ?? '';
const ACS_YEARS = [2024, 2023, 2022] as const;

type SourceName = 'FRED' | 'Census' | 'College Scorecard' | 'USAspending' | 'BEA';

interface SourceCounts {
  attempted: number;
  succeeded: number;
  failed: number;
  unavailable: number;
}

const counts: Record<SourceName, SourceCounts> = {
  FRED: { attempted: 0, succeeded: 0, failed: 0, unavailable: 0 },
  Census: { attempted: 0, succeeded: 0, failed: 0, unavailable: 0 },
  'College Scorecard': { attempted: 0, succeeded: 0, failed: 0, unavailable: 0 },
  USAspending: { attempted: 0, succeeded: 0, failed: 0, unavailable: 0 },
  BEA: { attempted: 0, succeeded: 0, failed: 0, unavailable: 0 },
};

const sourceAttemptLog: Array<{
  source: SourceName;
  id: string;
  ok: boolean;
  status?: number;
  message?: string;
  retrievedAt: string;
}> = [];

const STATES = [
  ['AL', '01', 'alabama'], ['AK', '02', 'alaska'], ['AZ', '04', 'arizona'], ['AR', '05', 'arkansas'],
  ['CA', '06', 'california'], ['CO', '08', 'colorado'], ['CT', '09', 'connecticut'], ['DE', '10', 'delaware'],
  ['FL', '12', 'florida'], ['GA', '13', 'georgia'], ['HI', '15', 'hawaii'], ['ID', '16', 'idaho'],
  ['IL', '17', 'illinois'], ['IN', '18', 'indiana'], ['IA', '19', 'iowa'], ['KS', '20', 'kansas'],
  ['KY', '21', 'kentucky'], ['LA', '22', 'louisiana'], ['ME', '23', 'maine'], ['MD', '24', 'maryland'],
  ['MA', '25', 'massachusetts'], ['MI', '26', 'michigan'], ['MN', '27', 'minnesota'], ['MS', '28', 'mississippi'],
  ['MO', '29', 'missouri'], ['MT', '30', 'montana'], ['NE', '31', 'nebraska'], ['NV', '32', 'nevada'],
  ['NH', '33', 'new-hampshire'], ['NJ', '34', 'new-jersey'], ['NM', '35', 'new-mexico'], ['NY', '36', 'new-york'],
  ['NC', '37', 'north-carolina'], ['ND', '38', 'north-dakota'], ['OH', '39', 'ohio'], ['OK', '40', 'oklahoma'],
  ['OR', '41', 'oregon'], ['PA', '42', 'pennsylvania'], ['RI', '44', 'rhode-island'], ['SC', '45', 'south-carolina'],
  ['SD', '46', 'south-dakota'], ['TN', '47', 'tennessee'], ['TX', '48', 'texas'], ['UT', '49', 'utah'],
  ['VT', '50', 'vermont'], ['VA', '51', 'virginia'], ['WA', '53', 'washington'], ['WV', '54', 'west-virginia'],
  ['WI', '55', 'wisconsin'], ['WY', '56', 'wyoming'],
].map(([abbr, fips, slug]) => ({ abbr, fips, slug, name: toTitle(slug) }));

const STATE_BY_FIPS = new Map(STATES.map(state => [state.fips, state]));
const STATE_BY_ABBR = new Map(STATES.map(state => [state.abbr, state]));

function toTitle(slug: string): string {
  return slug.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || value === '.') return null;
  const parsed = Number(value);
  if (parsed <= -666666666) return null;
  return Number.isFinite(parsed) ? parsed : null;
}

function dataPoint(args: {
  value: number | null;
  unit: string;
  geography: string;
  date: string;
  sourceName: string;
  sourceUrl: string;
  sourceDataset: string;
  sourceSeriesId?: string;
  transformation?: string;
  methodologyNote?: string;
  unavailableReason?: string;
}) {
  return {
    value: args.value,
    unit: args.unit,
    geography: args.geography,
    date: args.date,
    sourceName: args.sourceName,
    sourceUrl: args.sourceUrl,
    sourceDataset: args.sourceDataset,
    sourceSeriesId: args.sourceSeriesId,
    lastFetchedAt: NOW,
    transformation: args.transformation ?? 'latest official observation',
    methodologyNote: args.methodologyNote ?? 'Pulled from the cited official public source.',
    availability: args.value === null ? 'unavailable' : 'available',
    unavailableReason: args.value === null ? args.unavailableReason ?? 'Official source returned no current numeric value.' : undefined,
  };
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function cacheRaw(source: string, id: string, data: unknown): void {
  const safe = `${source}-${slugify(id) || 'response'}.json`;
  writeJson(path.join(RAW_DIR, safe), { retrievedAt: NOW, source, id, data });
}

async function fetchJson(source: SourceName, id: string, url: string, init?: RequestInit, attempts = 4): Promise<unknown | null> {
  counts[source].attempted += 1;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      if (res.status === 429 && attempt < attempts) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
      if (!res.ok) {
        const body = await res.text();
        if (attempt < attempts && (res.status === 429 || res.status >= 500)) {
          await sleep(500 * 2 ** (attempt - 1));
          continue;
        }
        counts[source].failed += 1;
        sourceAttemptLog.push({ source, id, ok: false, status: res.status, message: body.slice(0, 180), retrievedAt: NOW });
        return null;
      }
      const json = await res.json() as unknown;
      counts[source].succeeded += 1;
      sourceAttemptLog.push({ source, id, ok: true, status: res.status, retrievedAt: NOW });
      cacheRaw(source, id, json);
      return json;
    } catch (error) {
      clearTimeout(timeout);
      if (attempt < attempts) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
      counts[source].failed += 1;
      sourceAttemptLog.push({ source, id, ok: false, message: error instanceof Error ? error.message : String(error), retrievedAt: NOW });
      return null;
    }
  }
  counts[source].failed += 1;
  return null;
}

async function fetchFred(seriesId: string, geography: string, unit: string) {
  if (!FRED_API_KEY) {
    counts.FRED.unavailable += 1;
    return dataPoint({
      value: null,
      unit,
      geography,
      date: 'unavailable',
      sourceName: 'Federal Reserve Economic Data (FRED)',
      sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
      sourceDataset: `FRED Series ${seriesId}`,
      sourceSeriesId: seriesId,
      unavailableReason: 'FRED_API_KEY was not present at build time.',
    });
  }
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
  const json = await fetchJson('FRED', seriesId, url) as { observations?: Array<{ date: string; value: string }> } | null;
  await sleep(550);
  const obs = json?.observations?.find(item => item.value !== '.');
  const value = numberOrNull(obs?.value);
  if (value === null) counts.FRED.unavailable += 1;
  return dataPoint({
    value,
    unit,
    geography,
    date: obs?.date ?? 'unavailable',
    sourceName: 'Federal Reserve Economic Data (FRED)',
    sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
    sourceDataset: `FRED Series ${seriesId}`,
    sourceSeriesId: seriesId,
    unavailableReason: 'FRED returned no current numeric observation for this series.',
  });
}

interface AcsFetchResult {
  rows: string[][] | null;
  year: number;
  sourceUrl: string;
}

async function fetchCensus(pathPart: string, id: string, years: readonly number[] = ACS_YEARS): Promise<AcsFetchResult> {
  const fallbackYear = years[years.length - 1] ?? 2022;
  if (!CENSUS_API_KEY) {
    counts.Census.unavailable += 1;
    return {
      rows: null,
      year: fallbackYear,
      sourceUrl: `https://api.census.gov/data/${fallbackYear}/acs/acs5`,
    };
  }
  const sep = pathPart.includes('?') ? '&' : '?';
  for (const year of years) {
    const sourceUrl = `https://api.census.gov/data/${year}/acs/acs5`;
    const url = `${sourceUrl}${pathPart}${sep}key=${CENSUS_API_KEY}`;
    const rows = await fetchJson('Census', `${id}-${year}`, url) as string[][] | null;
    if (rows && rows.length >= 2) {
      console.log(`ACS ${id}: using ${year} 5-Year`);
      return { rows, year, sourceUrl };
    }
    console.log(`ACS ${id}: ${year} unavailable, trying fallback`);
  }
  counts.Census.unavailable += 1;
  return {
    rows: null,
    year: fallbackYear,
    sourceUrl: `https://api.census.gov/data/${fallbackYear}/acs/acs5`,
  };
}

function parseCensusRows(rows: string[][] | null): Array<Record<string, string>> {
  if (!rows || rows.length < 2) return [];
  const [header, ...body] = rows;
  return body.map(row => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ''])));
}

async function fetchStateAcs() {
  const result = await fetchCensus('?get=NAME,B01003_001E,B19013_001E,B25077_001E,B25064_001E&for=state:*', 'acs-states');
  return { ...result, records: parseCensusRows(result.rows) };
}

async function fetchCountyAcs() {
  const result = await fetchCensus('?get=NAME,B01003_001E,B19013_001E,B25077_001E,B25064_001E&for=county:*&in=state:*', 'acs-counties');
  return { ...result, records: parseCensusRows(result.rows) };
}

async function fetchPlaceAcs() {
  const result = await fetchCensus('?get=NAME,B01003_001E,B19013_001E,B25077_001E,B25064_001E&for=place:*&in=state:*', 'acs-places');
  return { ...result, records: parseCensusRows(result.rows) };
}

function acsDataset(year: number, variable: string): string {
  return `ACS ${year} 5-Year ${variable}`;
}

function acsSourceLabel(year: number): string {
  return `U.S. Census Bureau ACS ${year} 5-Year`;
}

function metroProxy(point: ReturnType<typeof dataPoint>, city: string, msaLabel: string) {
  return {
    ...point,
    geography: `${msaLabel} (metro-area proxy for ${city}, Colorado)`,
    sourceName: 'Federal Reserve Economic Data (FRED), sourced from BLS LAUS',
    sourceDataset: `${msaLabel} - BLS LAUS via FRED Series ${point.sourceSeriesId ?? 'unknown'}`,
    methodologyNote: `Metro-area unemployment is used as a proxy for ${city} because city-level unemployment is not published in this build.`,
  };
}

async function fetchCollegeScorecard(state: string) {
  if (!COLLEGE_SCORECARD_API_KEY) {
    counts['College Scorecard'].unavailable += 1;
    return [];
  }
  const fields = [
    'id',
    'school.name',
    'school.city',
    'school.state',
    'school.ownership',
    'latest.cost.avg_net_price.public',
    'latest.cost.avg_net_price.private',
    'latest.completion.rate_suppressed.overall',
    'latest.earnings.10_yrs_after_entry.median',
    'latest.aid.median_debt.completers.overall',
  ].join(',');
  const url = `https://api.data.gov/ed/collegescorecard/v1/schools?school.state=${state}&fields=${fields}&per_page=100&api_key=${COLLEGE_SCORECARD_API_KEY}`;
  const json = await fetchJson('College Scorecard', `scorecard-${state}`, url) as { results?: Array<Record<string, unknown>> } | null;
  await sleep(150);
  return json?.results ?? [];
}

async function fetchUSASpendingState(state: string, fiscalYear = 2024) {
  const body = {
    scope: 'place_of_performance',
    geo_layer: 'state',
    geo_layer_filters: [state],
    filters: {
      time_period: [{ start_date: `${fiscalYear - 1}-10-01`, end_date: `${fiscalYear}-09-30` }],
    },
    subawards: false,
  };
  const json = await fetchJson('USAspending', `state-${state}-${fiscalYear}`, 'https://api.usaspending.gov/api/v2/search/spending_by_geography/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as { results?: Array<Record<string, unknown>> } | null;
  await sleep(150);
  return json?.results ?? [];
}

async function fetchBeaStateGdp() {
  if (!BEA_API_KEY) {
    counts.BEA.unavailable += 1;
    return [];
  }
  const url = `https://apps.bea.gov/api/data?UserID=${BEA_API_KEY}&method=GetData&datasetname=Regional&TableName=SAGDP2N&LineCode=1&GeoFips=STATE&Year=LAST5&ResultFormat=JSON`;
  const json = await fetchJson('BEA', 'state-gdp', url) as { BEAAPI?: { Results?: { Data?: Array<Record<string, string>> } } } | null;
  return json?.BEAAPI?.Results?.Data ?? [];
}

function scoreFromMetrics(population: number | null, income: number | null, home: number | null, unemployment: number | null, spendingPerCapita: number | null): number | null {
  if (population === null || income === null) return null;
  const incomeScore = Math.min(35, Math.max(0, (income / 120000) * 35));
  const affordabilityScore = home && income ? Math.max(0, 25 - Math.min(25, (home / Math.max(income, 1)) * 3)) : 12;
  const laborScore = unemployment === null ? 15 : Math.max(0, 25 - unemployment * 2.5);
  const sizeScore = Math.min(10, Math.log10(Math.max(population, 1)) * 1.5);
  const fiscalScore = spendingPerCapita === null ? 5 : Math.min(5, spendingPerCapita / 3000);
  return Math.round((incomeScore + affordabilityScore + laborScore + sizeScore + fiscalScore) * 10) / 10;
}

function stateFredSeries(abbr: string) {
  return {
    unemployment: `${abbr}URN`,
    population: `${abbr}POP`,
    gdp: `${abbr}RGSP`,
  };
}

async function main() {
  console.log('=== LocalLedger Data Fetch ===');
  console.log(`Timestamp: ${NOW}`);
  console.log(`Keys: FRED=${Boolean(FRED_API_KEY)} Census=${Boolean(CENSUS_API_KEY)} Scorecard=${Boolean(COLLEGE_SCORECARD_API_KEY)} BEA=${Boolean(BEA_API_KEY)}`);

  const [stateAcs, countyAcs, placeAcs, beaRows] = await Promise.all([
    fetchStateAcs(),
    fetchCountyAcs(),
    fetchPlaceAcs(),
    fetchBeaStateGdp(),
  ]);
  const stateRows = stateAcs.records;
  const countyRows = countyAcs.records;
  const placeRows = placeAcs.records;

  const gdpByState = new Map<string, Record<string, string>>();
  for (const row of beaRows) {
    const state = STATE_BY_FIPS.get(row.GeoFips ?? '');
    if (state) gdpByState.set(state.abbr, row);
  }

  const stateAcsByFips = new Map(stateRows.map(row => [row.state, row]));
  const allStates = [];
  const allCounties = [];
  const allColleges = [];
  const federalRows = [];

  const usUnemployment = await fetchFred('UNRATE', 'United States', 'percent');
  const usMedianIncome = dataPoint({
    value: null,
    unit: 'USD',
    geography: 'United States',
    date: 'unavailable',
    sourceName: 'U.S. Census Bureau',
    sourceUrl: stateAcs.sourceUrl,
    sourceDataset: 'ACS 5-Year Estimates',
    unavailableReason: 'National ACS value is not part of this build query.',
  });
  const coloradoMsaFred = {
    denver: await fetchFred('DENV708URN', 'Denver-Aurora-Lakewood, CO MSA', 'percent'),
    boulder: await fetchFred('BOUL708URN', 'Boulder, CO MSA', 'percent'),
    coloradoSprings: await fetchFred('COLO708URN', 'Colorado Springs, CO MSA', 'percent'),
    fortCollins: await fetchFred('FTCO708URN', 'Fort Collins, CO MSA', 'percent'),
  };

  for (const state of STATES) {
    const acs = stateAcsByFips.get(state.fips);
    const series = stateFredSeries(state.abbr);
    const unemployment = await fetchFred(series.unemployment, state.name, 'percent');
    const fredPopulation = await fetchFred(series.population, state.name, 'thousands of persons');
    const fredGdp = await fetchFred(series.gdp, state.name, 'millions of chained 2017 dollars');
    const spending = await fetchUSASpendingState(state.abbr);
    const spendingTotal = spending.reduce((sum, item) => sum + (numberOrNull(item.aggregated_amount) ?? numberOrNull(item.amount) ?? 0), 0);
    const acsPopulation = numberOrNull(acs?.B01003_001E);
    const populationValue = acsPopulation ?? (fredPopulation.value === null ? null : fredPopulation.value * 1000);
    const spendingPerCapita = populationValue && spendingTotal ? spendingTotal / populationValue : null;
    const income = numberOrNull(acs?.B19013_001E);
    const home = numberOrNull(acs?.B25077_001E);
    const gdpValue = fredGdp.value ?? numberOrNull(gdpByState.get(state.abbr)?.DataValue?.replace(/,/g, ''));
    const economyScore = scoreFromMetrics(populationValue, income, home, unemployment.value, spendingPerCapita);

    const stateRecord = {
      slug: state.slug,
      name: state.name,
      abbreviation: state.abbr,
      fips: state.fips,
      population: dataPoint({
        value: populationValue,
        unit: 'persons',
        geography: state.name,
        date: String(stateAcs.year),
        sourceName: 'U.S. Census Bureau',
        sourceUrl: stateAcs.sourceUrl,
        sourceDataset: acsDataset(stateAcs.year, 'B01003_001E'),
      }),
      medianHouseholdIncome: dataPoint({
        value: income,
        unit: 'USD',
        geography: state.name,
        date: String(stateAcs.year),
        sourceName: 'U.S. Census Bureau',
        sourceUrl: stateAcs.sourceUrl,
        sourceDataset: acsDataset(stateAcs.year, 'B19013_001E'),
      }),
      medianHomeValue: dataPoint({
        value: home,
        unit: 'USD',
        geography: state.name,
        date: String(stateAcs.year),
        sourceName: 'U.S. Census Bureau',
        sourceUrl: stateAcs.sourceUrl,
        sourceDataset: acsDataset(stateAcs.year, 'B25077_001E'),
      }),
      unemploymentRate: unemployment,
      gdp: gdpValue === fredGdp.value ? fredGdp : dataPoint({
        value: gdpValue,
        unit: 'millions of current dollars',
        geography: state.name,
        date: gdpByState.get(state.abbr)?.TimePeriod ?? 'unavailable',
        sourceName: 'Bureau of Economic Analysis (BEA)',
        sourceUrl: 'https://apps.bea.gov/api/',
        sourceDataset: 'Regional SAGDP2N',
      }),
      federalSpendingPerCapita: dataPoint({
        value: spendingPerCapita,
        unit: 'USD per person',
        geography: state.name,
        date: 'FY2024',
        sourceName: 'USAspending.gov',
        sourceUrl: 'https://api.usaspending.gov/',
        sourceDataset: 'USAspending API v2 spending_by_geography',
      }),
      localEconomyScore: dataPoint({
        value: economyScore,
        unit: 'score',
        geography: state.name,
        date: NOW.slice(0, 10),
        sourceName: 'LocalLedger methodology',
        sourceUrl: 'https://local-ledger.net/methodology/',
        sourceDataset: 'Composite score from Census, FRED, and USAspending',
        transformation: 'weighted score',
        methodologyNote: 'Weighted score using income, affordability, labor market, population scale, and federal spending per capita.',
      }),
    };

    allStates.push(stateRecord);
    federalRows.push({
      state: state.name,
      stateSlug: state.slug,
      stateAbbreviation: state.abbr,
      fiscalYear: 2024,
      total: spendingTotal || null,
      perCapita: spendingPerCapita,
      source: 'USAspending.gov',
    });

    const stateCounties = countyRows
      .filter(row => row.state === state.fips)
      .map(row => {
        const countyName = (row.NAME ?? '').replace(`, ${state.name}`, '');
        const population = numberOrNull(row.B01003_001E);
        const medianIncome = numberOrNull(row.B19013_001E);
        const medianHome = numberOrNull(row.B25077_001E);
        return {
          slug: slugify(countyName.replace(/ County| Parish| Borough| Census Area| Municipality/g, '')),
          county: countyName,
          state: state.name,
          stateSlug: state.slug,
          stateAbbreviation: state.abbr,
          fips: `${row.state}${row.county}`,
          population,
          medianHouseholdIncome: medianIncome,
          medianHomeValue: medianHome,
          localEconomyScore: scoreFromMetrics(population, medianIncome, medianHome, unemployment.value, spendingPerCapita),
          source: acsSourceLabel(countyAcs.year),
          lastFetchedAt: NOW,
        };
      })
      .sort((a, b) => (b.population ?? 0) - (a.population ?? 0));

    allCounties.push(...stateCounties);

    const colleges = (await fetchCollegeScorecard(state.abbr)).map(item => {
      const publicPrice = numberOrNull(item['latest.cost.avg_net_price.public']);
      const privatePrice = numberOrNull(item['latest.cost.avg_net_price.private']);
      const earnings = numberOrNull(item['latest.earnings.10_yrs_after_entry.median']);
      const debt = numberOrNull(item['latest.aid.median_debt.completers.overall']);
      const gradRate = numberOrNull(item['latest.completion.rate_suppressed.overall']);
      const netPrice = publicPrice ?? privatePrice;
      const valueScore = earnings && netPrice ? Math.round(Math.max(0, Math.min(100, (earnings / Math.max(netPrice, 1)) * 18 + (gradRate ?? 0) * 25))) : null;
      return {
        unitId: String(item.id),
        name: String(item['school.name'] ?? ''),
        city: String(item['school.city'] ?? ''),
        state: state.name,
        stateSlug: state.slug,
        stateAbbreviation: state.abbr,
        type: item['school.ownership'] === 1 ? 'Public' : item['school.ownership'] === 2 ? 'Private nonprofit' : 'Private for-profit',
        netPrice,
        graduationRate: gradRate,
        medianEarnings: earnings,
        medianDebt: debt,
        debtToEarningsRatio: debt && earnings ? debt / earnings : null,
        valueScore,
        source: 'College Scorecard',
        lastFetchedAt: NOW,
      };
    });
    allColleges.push(...colleges);

    const stateFile = {
      _meta: {
        description: `${state.name} state economic dashboard data`,
        generatedAt: NOW,
        sourceAttemptLog,
      },
      state: stateRecord,
      counties: stateCounties,
      colleges,
      federalSpending: federalRows.filter(row => row.stateSlug === state.slug),
    recessionRadar: {
      overall: unemployment.value !== null && unemployment.value > 5 ? 'moderate' : 'low',
      score: unemployment.value === null ? null : Math.min(100, Math.round(unemployment.value * 10)),
      components: {
        unemploymentTrend: unemployment.value !== null && unemployment.value > 5 ? 'rising' : 'stable',
        housingActivity: 'stable',
        laborMarket: unemployment.value !== null && unemployment.value > 5 ? 'weakening' : 'stable',
      },
      methodologyNote: 'Educational indicator based on latest state unemployment relative to simple public thresholds.',
      sources: ['FRED state unemployment series'],
    },
    };
    writeJson(path.join(STATE_DIR, `${state.slug}.json`), stateFile);
    writeJson(path.join(PUBLIC_STATE_DIR, `${state.slug}.json`), stateFile);
  }

  const places = placeRows
    .map(row => {
      const state = STATE_BY_FIPS.get(row.state);
      if (!state) return null;
      const name = (row.NAME ?? '').replace(`, ${state.name}`, '');
      return {
        slug: slugify(name),
        name,
        state: state.name,
        stateSlug: state.slug,
        stateAbbreviation: state.abbr,
        population: numberOrNull(row.B01003_001E),
        medianHouseholdIncome: numberOrNull(row.B19013_001E),
        medianHomeValue: numberOrNull(row.B25077_001E),
        medianRent: numberOrNull(row.B25064_001E),
        placeFips: row.place,
        source: acsSourceLabel(placeAcs.year),
        sourceUrl: placeAcs.sourceUrl,
        acsYear: placeAcs.year,
        lastFetchedAt: NOW,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0));

  const metros = places.slice(0, 120).map(place => ({
    slug: `${place.slug}-${place.stateAbbreviation.toLowerCase()}`,
    name: place.name,
    state: place.state,
    stateSlug: place.stateSlug,
    population: place.population,
    medianHouseholdIncome: place.medianHouseholdIncome,
    medianHomeValue: place.medianHomeValue,
    medianRent: place.medianRent,
    source: place.source,
    lastFetchedAt: NOW,
  }));

  const colorado = allStates.find(state => state.slug === 'colorado');
  const coloradoStateFile = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'colorado.json'), 'utf-8')) as Record<string, unknown>;

  const coloradoCityConfig = {
    denver: { city: 'Denver', placeFips: '20000', unemploymentRate: metroProxy(coloradoMsaFred.denver, 'Denver', 'Denver-Aurora-Lakewood MSA') },
    boulder: { city: 'Boulder', placeFips: '07850', unemploymentRate: metroProxy(coloradoMsaFred.boulder, 'Boulder', 'Boulder MSA') },
    coloradoSprings: { city: 'Colorado Springs', placeFips: '16000', unemploymentRate: metroProxy(coloradoMsaFred.coloradoSprings, 'Colorado Springs', 'Colorado Springs MSA') },
    fortCollins: { city: 'Fort Collins', placeFips: '27425', unemploymentRate: metroProxy(coloradoMsaFred.fortCollins, 'Fort Collins', 'Fort Collins MSA') },
    aurora: { city: 'Aurora', placeFips: '04000', unemploymentRate: metroProxy(coloradoMsaFred.denver, 'Aurora', 'Denver-Aurora-Lakewood MSA') },
  };

  writeJson(path.join(PROCESSED_DIR, 'states.json'), { _meta: { generatedAt: NOW, description: 'All state dashboard index', sourceAttemptLog }, states: allStates });
  writeJson(path.join(PUBLIC_DIR, 'states.json'), { _meta: { generatedAt: NOW, description: 'All state dashboard index', sourceAttemptLog }, states: allStates });
  writeJson(path.join(PROCESSED_DIR, 'counties.json'), { _meta: { generatedAt: NOW, description: 'County ACS data by state', sourceAttemptLog }, counties: allCounties });
  writeJson(path.join(PUBLIC_DIR, 'counties.json'), { _meta: { generatedAt: NOW, description: 'County ACS data by state', sourceAttemptLog }, counties: allCounties });
  const cityFile = {
    _meta: { generatedAt: NOW, description: 'Place ACS data for search and city pages' },
    cities: places,
    denver: { state: 'Colorado', ...coloradoCityConfig.denver },
    boulder: { state: 'Colorado', ...coloradoCityConfig.boulder },
    coloradoSprings: { state: 'Colorado', ...coloradoCityConfig.coloradoSprings },
    fortCollins: { state: 'Colorado', ...coloradoCityConfig.fortCollins },
    aurora: { state: 'Colorado', ...coloradoCityConfig.aurora },
  };
  writeJson(path.join(PROCESSED_DIR, 'cities.json'), cityFile);
  writeJson(path.join(PUBLIC_DIR, 'cities.json'), cityFile);
  writeJson(path.join(PROCESSED_DIR, 'metros.json'), { _meta: { generatedAt: NOW, description: 'Major place-based metro preview data' }, metros });
  writeJson(path.join(PUBLIC_DIR, 'metros.json'), { _meta: { generatedAt: NOW, description: 'Major place-based metro preview data' }, metros });
  writeJson(path.join(PROCESSED_DIR, 'colleges.json'), {
    _meta: {
      generatedAt: NOW,
      description: 'National college ROI data from College Scorecard',
      disclaimer: 'College ROI metrics are simplified indicators from public data and are not a complete measure of fit or quality.',
      source: { name: 'College Scorecard', url: 'https://collegescorecard.ed.gov/', lastFetchedAt: NOW },
    },
    colleges: allColleges,
  });
  writeJson(path.join(PUBLIC_DIR, 'colleges.json'), {
    _meta: {
      generatedAt: NOW,
      description: 'National college ROI data from College Scorecard',
      disclaimer: 'College ROI metrics are simplified indicators from public data and are not a complete measure of fit or quality.',
      source: { name: 'College Scorecard', url: 'https://collegescorecard.ed.gov/', lastFetchedAt: NOW },
    },
    colleges: allColleges,
  });
  const coloradoFederal = federalRows.find(row => row.stateSlug === 'colorado');
  const federalFile = {
    _meta: { generatedAt: NOW, description: 'Federal spending by state', source: { name: 'USAspending.gov', url: 'https://www.usaspending.gov/', dataset: 'USAspending API v2', lastFetchedAt: NOW } },
    states: federalRows,
    stateTotal: coloradoFederal ? [{ shape_code: 'CO', display_name: 'Colorado', aggregated_amount: coloradoFederal.total }] : [],
  };
  writeJson(path.join(PROCESSED_DIR, 'federal-spending.json'), federalFile);
  writeJson(path.join(PUBLIC_DIR, 'federal-spending.json'), federalFile);
  writeJson(path.join(PROCESSED_DIR, 'colorado-overview.json'), { ...(coloradoStateFile as object), _meta: { ...(coloradoStateFile._meta as object), description: 'Colorado statewide economic overview' }, ...(colorado ? { unemploymentRate: colorado.unemploymentRate, medianHouseholdIncome: colorado.medianHouseholdIncome, gdp: colorado.gdp, population: colorado.population, usUnemploymentRate: usUnemployment, usMedianHouseholdIncome: usMedianIncome } : {}) });
  writeJson(path.join(PUBLIC_DIR, 'colorado-overview.json'), JSON.parse(fs.readFileSync(path.join(PROCESSED_DIR, 'colorado-overview.json'), 'utf-8')));
  writeJson(path.join(PROCESSED_DIR, 'recession-indicator.json'), {
    _meta: { generatedAt: NOW, description: 'Colorado Slowdown Risk Indicator', disclaimer: 'Educational model, not financial advice.' },
    ...(coloradoStateFile.recessionRadar as object),
    lastUpdated: NOW,
  });
  writeJson(path.join(PUBLIC_DIR, 'recession-indicator.json'), JSON.parse(fs.readFileSync(path.join(PROCESSED_DIR, 'recession-indicator.json'), 'utf-8')));

  const searchIndex = [
    ...allStates.map(state => ({ label: state.name, type: 'State', href: `/states/${state.slug}/` })),
    ...allCounties.slice(0, 1000).map(county => ({ label: `${county.county}, ${county.stateAbbreviation}`, type: 'County', href: `/counties/${county.stateSlug}/${county.slug}/` })),
    ...metros.map(metro => ({ label: `${metro.name}, ${metro.state}`, type: 'Metro', href: `/metros/${metro.slug}/` })),
  ];
  writeJson(path.join(PUBLIC_DIR, 'search-index.json'), { generatedAt: NOW, items: searchIndex });

  const metadata = {
    generatedAt: NOW,
    sourceCounts: counts,
    sourceAttemptLog,
    datasets: [
      { id: 'states', name: 'State dashboards', source: 'Census, FRED, BEA, USAspending', file: '/data/processed/states.json', lastFetchedAt: NOW },
      { id: 'counties', name: 'County data', source: 'Census ACS', file: '/data/processed/counties.json', lastFetchedAt: NOW },
      { id: 'metros', name: 'Metro preview data', source: 'Census ACS', file: '/data/processed/metros.json', lastFetchedAt: NOW },
      { id: 'colleges', name: 'College ROI', source: 'College Scorecard', file: '/data/processed/colleges.json', lastFetchedAt: NOW },
      { id: 'federal-spending', name: 'Federal spending', source: 'USAspending.gov', file: '/data/processed/federal-spending.json', lastFetchedAt: NOW },
    ],
  };
  writeJson(path.join(PROCESSED_DIR, 'metadata-catalog.json'), metadata);
  writeJson(path.join(process.cwd(), 'data', 'metadata', 'catalog.json'), metadata);
  writeJson(path.join(PUBLIC_DIR, 'metadata-catalog.json'), metadata);

  console.log('\n=== Source fetch report ===');
  for (const [source, value] of Object.entries(counts)) {
    console.log(`${source}: attempted=${value.attempted} succeeded=${value.succeeded} failed=${value.failed} unavailable=${value.unavailable}`);
  }
  console.log('Data fetch complete.');
}

main().catch(error => {
  console.error('Fatal error in data fetch:', error);
  process.exit(1);
});
