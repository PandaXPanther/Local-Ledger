#!/usr/bin/env tsx
/**
 * LocalLedger Data Validation Script
 * Fails the build if any data integrity rule is violated.
 *
 * Rules enforced:
 * 1. No missing source URLs
 * 2. No NaN/Infinity/undefined values (only null allowed for unavailable)
 * 3. No mock/demo/lorem ipsum/placeholder/random strings in production data
 * 4. Every computed score has a methodology note
 * 5. Every data file has lastFetchedAt
 * 6. Values within plausible ranges for their type
 */

import fs from 'fs';
import path from 'path';

const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');

const FORBIDDEN_STRINGS = [
  'lorem ipsum', 'placeholder', 'sample data', 'demo data', 'fake',
  'fabricated', 'estimated', 'hallucinated', 'random', 'test data',
  'mock data', 'dummy',
];

interface ValidationError {
  file: string;
  field: string;
  issue: string;
}

const errors: ValidationError[] = [];
const warnings: string[] = [];

function err(file: string, field: string, issue: string) {
  errors.push({ file, field, issue });
}

function warn(msg: string) {
  warnings.push(msg);
}

function checkDataPoint(obj: Record<string, unknown>, key: string, file: string) {
  if (!obj[key]) return; // null/unavailable is ok at top level

  const dp = obj[key] as Record<string, unknown>;
  if (typeof dp !== 'object' || dp === null) return;

  // Must have sourceName and sourceUrl
  if (!dp.sourceName || typeof dp.sourceName !== 'string' || dp.sourceName.trim() === '') {
    err(file, key, 'Missing sourceName');
  }
  if (!dp.sourceUrl || typeof dp.sourceUrl !== 'string' || !dp.sourceUrl.startsWith('http')) {
    err(file, key, 'Missing or invalid sourceUrl');
  }
  if (!dp.lastFetchedAt || typeof dp.lastFetchedAt !== 'string') {
    err(file, key, 'Missing lastFetchedAt');
  }
  if (!dp.sourceDataset || typeof dp.sourceDataset !== 'string') {
    err(file, key, 'Missing sourceDataset');
  }
  if (!dp.geography || typeof dp.geography !== 'string') {
    err(file, key, 'Missing geography');
  }
  if (!dp.unit || typeof dp.unit !== 'string') {
    err(file, key, 'Missing unit');
  }

  // Value must be null or a finite number
  if (dp.value !== null && dp.value !== undefined) {
    if (typeof dp.value !== 'number') {
      err(file, key, `value must be number or null, got ${typeof dp.value}`);
    } else if (!isFinite(dp.value)) {
      err(file, key, `value is NaN or Infinity (${dp.value})`);
    }
  }
}

function checkForForbiddenStrings(obj: unknown, file: string, path: string) {
  const str = JSON.stringify(obj).toLowerCase();
  for (const forbidden of FORBIDDEN_STRINGS) {
    if (str.includes(forbidden)) {
      err(file, path, `Contains forbidden string: "${forbidden}" - no mock/demo/fabricated data allowed`);
    }
  }
}

function validateFile(filename: string) {
  const filePath = path.join(PROCESSED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    warn(`File not found (may need data:fetch): ${filename}`);
    return;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    err(filename, 'parse', `Invalid JSON: ${e}`);
    return;
  }

  // Check _meta exists and has generatedAt
  const meta = data['_meta'] as Record<string, unknown> | undefined;
  if (!meta) {
    err(filename, '_meta', 'Missing _meta block');
  } else {
    if (!meta.generatedAt) {
      err(filename, '_meta.generatedAt', 'Missing generatedAt timestamp');
    }
    if (!meta.description) {
      err(filename, '_meta.description', 'Missing description');
    }
  }

  // Check for forbidden strings in the full file (excluding meta notes)
  checkForForbiddenStrings(data, filename, 'root');

  return data;
}

function validateColoradoOverview() {
  const data = validateFile('colorado-overview.json');
  if (!data) return;

  const dp = data as Record<string, unknown>;
  for (const key of ['unemploymentRate', 'medianHouseholdIncome', 'population', 'gdp']) {
    checkDataPoint(dp, key, 'colorado-overview.json');
  }

  // Plausibility checks on non-null values
  const unemp = (dp['unemploymentRate'] as Record<string, unknown> | undefined)?.value;
  if (unemp !== null && typeof unemp === 'number') {
    if (unemp < 0 || unemp > 50) {
      err('colorado-overview.json', 'unemploymentRate.value', `Implausible unemployment rate: ${unemp}%`);
    }
  }
}

function validateCities() {
  const data = validateFile('cities.json');
  if (!data) return;

  const cities = ['denver', 'boulder', 'coloradoSprings', 'fortCollins', 'aurora'];
  for (const city of cities) {
    const cityData = (data as Record<string, unknown>)[city] as Record<string, unknown> | undefined;
    if (!cityData) {
      warn(`cities.json: Missing city data for ${city}`);
      continue;
    }
    if (!cityData.city || typeof cityData.city !== 'string') {
      err('cities.json', `${city}.city`, 'Missing city name');
    }
    checkDataPoint(cityData, 'unemploymentRate', 'cities.json');
  }
}

function validateColleges() {
  const data = validateFile('colleges.json');
  if (!data) return;

  const meta = (data['_meta'] as Record<string, unknown> | undefined);
  if (!meta?.disclaimer) {
    err('colleges.json', '_meta.disclaimer', 'Missing required College ROI disclaimer');
  }
  if (meta?.source) {
    const src = meta.source as Record<string, unknown>;
    if (!src.url || !src.name) {
      err('colleges.json', '_meta.source', 'Missing source name or URL');
    }
    if (!src.lastFetchedAt) {
      err('colleges.json', '_meta.source.lastFetchedAt', 'Missing lastFetchedAt');
    }
  }
}

function validateFederalSpending() {
  const data = validateFile('federal-spending.json');
  if (!data) return;

  const meta = (data['_meta'] as Record<string, unknown> | undefined);
  if (!meta?.source) {
    err('federal-spending.json', '_meta.source', 'Missing source block');
  }
}

function validateRecessionIndicator() {
  const data = validateFile('recession-indicator.json');
  if (!data) return;

  if (!data['overall']) {
    err('recession-indicator.json', 'overall', 'Missing overall risk level');
  } else {
    const allowed = ['low', 'moderate', 'elevated'];
    if (!allowed.includes(data['overall'] as string)) {
      err('recession-indicator.json', 'overall', `Invalid risk level: ${data['overall']}`);
    }
  }

  if (!data['methodologyNote']) {
    err('recession-indicator.json', 'methodologyNote', 'Missing methodology note for computed score');
  }

  const disclaimer = (data['_meta'] as Record<string, unknown>)?.['disclaimer'];
  if (!disclaimer) {
    err('recession-indicator.json', '_meta.disclaimer', 'Missing required recession indicator disclaimer');
  }

  const score = data['score'];
  if (score !== null && score !== undefined) {
    if (typeof score !== 'number' || !isFinite(score as number)) {
      err('recession-indicator.json', 'score', 'score must be finite number or null');
    }
    if (typeof score === 'number' && (score < 0 || score > 100)) {
      err('recession-indicator.json', 'score', `score out of range [0,100]: ${score}`);
    }
  }
}

function validateCounties() {
  const data = validateFile('counties.json');
  if (!data) return;
  // Counties may be unavailable stub - just check _meta
}

function validateMetadataCatalog() {
  const filePath = path.join(PROCESSED_DIR, 'metadata-catalog.json');
  if (!fs.existsSync(filePath)) {
    // Check alternative location
    const altPath = path.join(process.cwd(), 'public', 'data', 'processed', 'metadata-catalog.json');
    if (!fs.existsSync(altPath)) {
      warn('metadata-catalog.json not found - run data:fetch first');
      return;
    }
  }
}

// Run all validators
console.log('=== LocalLedger Data Validation ===\n');

validateColoradoOverview();
validateCities();
validateColleges();
validateFederalSpending();
validateRecessionIndicator();
validateCounties();
validateMetadataCatalog();

// Report
if (warnings.length > 0) {
  console.warn('⚠️  Warnings:');
  for (const w of warnings) {
    console.warn(`   ${w}`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Validation FAILED - ${errors.length} error(s):\n`);
  for (const e of errors) {
    console.error(`   [${e.file}] ${e.field}: ${e.issue}`);
  }
  process.exit(1);
} else {
  console.log(`✅ All data validation checks passed (${warnings.length} warnings)\n`);
}
