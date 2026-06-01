#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CHECK_ROOTS = ['src', 'content', 'data/processed', 'README.md'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'out', 'dist']);
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx', '.yml', '.yaml', '.svg']);
const EM_DASH = String.fromCodePoint(0x2014);

function listFiles(target: string): string[] {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return [full];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) return [];
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) return listFiles(path.relative(ROOT, child));
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [child] : [];
  });
}

const hits: string[] = [];

for (const file of CHECK_ROOTS.flatMap(listFiles)) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes(EM_DASH)) {
      hits.push(`${path.relative(ROOT, file)}:${index + 1}:${line}`);
    }
  });
}

if (hits.length > 0) {
  console.error('U+2014 em dash is not allowed in checked repository paths.');
  for (const hit of hits) console.error(hit);
  process.exit(1);
}

console.log('No U+2014 em dash characters found in checked paths.');
