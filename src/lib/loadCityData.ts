import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { DataPoint } from '@/types/data';

export interface CitySnapshot {
  city: string;
  state: string;
  unemploymentRate: DataPoint;
  coloradoUnemploymentRate: DataPoint;
  usUnemploymentRate: DataPoint;
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

  return {
    city: cityData.city,
    state: 'Colorado',
    unemploymentRate: cityData.unemploymentRate,
    coloradoUnemploymentRate: overview.unemploymentRate,
    usUnemploymentRate: overview.usUnemploymentRate,
    generatedAt: cities._meta?.generatedAt ?? '',
  };
}
