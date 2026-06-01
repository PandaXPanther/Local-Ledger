import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { DataPoint } from '@/types/data';

export interface CitySnapshot {
  city: string;
  state: string;
  unemploymentRate: DataPoint;
  coloradoUnemploymentRate: DataPoint;
  usUnemploymentRate: DataPoint;
  medianHouseholdIncome: DataPoint | null;
  medianHomeValue: DataPoint | null;
  localEconomyScore: DataPoint | null;
  generatedAt: string;
}

const CITY_KEY_MAP: Record<string, string> = {
  denver: 'denver',
  boulder: 'boulder',
  'colorado-springs': 'coloradoSprings',
  'fort-collins': 'fortCollins',
  aurora: 'aurora',
};

export function loadCitySnapshot(slug: string): CitySnapshot | null {
  const citiesPath = join(process.cwd(), 'public', 'data', 'processed', 'cities.json');
  const overviewPath = join(process.cwd(), 'public', 'data', 'processed', 'colorado-overview.json');

  if (!existsSync(citiesPath) || !existsSync(overviewPath)) return null;

  const cities = JSON.parse(readFileSync(citiesPath, 'utf-8'));
  const overview = JSON.parse(readFileSync(overviewPath, 'utf-8'));

  const key = CITY_KEY_MAP[slug];
  if (!key) return null;

  const cityData = cities[key];
  if (!cityData) return null;
  const cityName = cityData.city ?? cityData.name;
  const place = Array.isArray(cities.cities)
    ? cities.cities.find((item: Record<string, unknown>) => item.stateSlug === 'colorado' && String(item.name).toLowerCase().includes(String(cityName).toLowerCase()))
    : null;

  const metric = (field: 'medianHouseholdIncome' | 'medianHomeValue', label: string, unit: string) => place ? {
    value: typeof place[field] === 'number' ? place[field] : null,
    unit,
    geography: `${cityName}, Colorado`,
    date: '2022',
    sourceName: 'U.S. Census Bureau',
    sourceUrl: 'https://api.census.gov/data/2022/acs/acs5',
    sourceDataset: `ACS 2022 5-Year ${label}`,
    lastFetchedAt: place.lastFetchedAt ?? cities._meta?.generatedAt ?? '',
    transformation: 'latest ACS 5-year estimate',
    methodologyNote: 'City-level estimate from Census ACS place data.',
  } as DataPoint : null;

  return {
    city: cityName,
    state: 'Colorado',
    unemploymentRate: cityData.unemploymentRate,
    coloradoUnemploymentRate: overview.unemploymentRate,
    usUnemploymentRate: overview.usUnemploymentRate,
    medianHouseholdIncome: metric('medianHouseholdIncome', 'B19013_001E', 'USD'),
    medianHomeValue: metric('medianHomeValue', 'B25077_001E', 'USD'),
    localEconomyScore: null,
    generatedAt: cities._meta?.generatedAt ?? '',
  };
}
