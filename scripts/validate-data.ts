#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');

const FORBIDDEN_STRINGS = [
  'lorem ipsum',
  'sample data',
  'demo data',
  'fake',
  'fabricated',
  'hallucinated',
  'test data',
  'mock data',
  'dummy',
];

interface ValidationError {
  file: string;
  field: string;
  issue: string;
}

const errors: ValidationError[] = [];
const warnings: string[] = [];

function err(file: string, field: string, issue: string): void {
  errors.push({ file, field, issue });
}

function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsonFiles(full);
    return entry.name.endsWith('.json') ? [full] : [];
  });
}

function inspectValue(value: unknown, file: string, keyPath: string): void {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    err(file, keyPath, 'Number is NaN or Infinity');
  }
  if (value === undefined) {
    err(file, keyPath, 'Undefined values are not allowed in production data');
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    for (const forbidden of FORBIDDEN_STRINGS) {
      if (lower.includes(forbidden)) {
        err(file, keyPath, `Contains forbidden production data string: ${forbidden}`);
      }
    }
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectValue(item, file, `${keyPath}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('value' in record && 'sourceName' in record) {
      validateMetric(record, file, keyPath);
    }
    for (const [key, child] of Object.entries(record)) {
      inspectValue(child, file, `${keyPath}.${key}`);
    }
  }
}

function validateMetric(metric: Record<string, unknown>, file: string, keyPath: string): void {
  for (const field of ['unit', 'geography', 'date', 'sourceName', 'sourceUrl', 'sourceDataset', 'lastFetchedAt']) {
    if (typeof metric[field] !== 'string' || String(metric[field]).trim() === '') {
      err(file, `${keyPath}.${field}`, 'Missing required metric metadata');
    }
  }
  if (typeof metric.sourceUrl !== 'string' || !metric.sourceUrl.startsWith('http')) {
    err(file, `${keyPath}.sourceUrl`, 'Source URL must be absolute');
  }
  if (metric.value !== null && typeof metric.value !== 'number') {
    err(file, `${keyPath}.value`, 'Metric value must be a number or null');
  }
  if (metric.value === null) {
    if (metric.availability !== 'unavailable') {
      err(file, `${keyPath}.availability`, 'Null metric values must be explicitly marked unavailable');
    }
    if (typeof metric.unavailableReason !== 'string' || metric.unavailableReason.trim() === '') {
      err(file, `${keyPath}.unavailableReason`, 'Unavailable metric requires a source attempt reason');
    }
  }
}

console.log('=== LocalLedger Data Validation ===');

const files = listJsonFiles(PROCESSED_DIR);
if (files.length === 0) {
  err('data/processed', 'root', 'No processed data files found');
}

for (const file of files) {
  const rel = path.relative(PROCESSED_DIR, file);
  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (error) {
    err(rel, 'parse', error instanceof Error ? error.message : String(error));
    continue;
  }
  if (!data || typeof data !== 'object') {
    err(rel, 'root', 'Top-level JSON must be an object');
    continue;
  }
  const meta = (data as Record<string, unknown>)._meta;
  if (rel !== 'metadata-catalog.json' && (!meta || typeof meta !== 'object')) {
    err(rel, '_meta', 'Missing _meta block');
  }
  if (meta && typeof meta === 'object') {
    const generatedAt = (meta as Record<string, unknown>).generatedAt;
    if (typeof generatedAt !== 'string' || generatedAt.trim() === '') {
      err(rel, '_meta.generatedAt', 'Missing generatedAt timestamp');
    }
  }
  inspectValue(data, rel, 'root');
}

const metadataPath = path.join(PROCESSED_DIR, 'metadata-catalog.json');
if (!fs.existsSync(metadataPath)) {
  err('metadata-catalog.json', 'root', 'Missing metadata catalog');
} else {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as { sourceCounts?: Record<string, unknown> };
  if (!metadata.sourceCounts) {
    err('metadata-catalog.json', 'sourceCounts', 'Missing per-source fetch report');
  }
}

if (warnings.length > 0) {
  console.warn('Warnings:');
  for (const warning of warnings) console.warn(`  ${warning}`);
}

if (errors.length > 0) {
  console.error(`Validation failed: ${errors.length} error(s)`);
  for (const error of errors.slice(0, 120)) {
    console.error(`  [${error.file}] ${error.field}: ${error.issue}`);
  }
  if (errors.length > 120) console.error(`  ... ${errors.length - 120} more`);
  process.exit(1);
}

console.log(`All data validation checks passed (${files.length} JSON files).`);
