import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero } from '@/components/Hero';
import { SourceBadge } from '@/components/SourceBadge';
import { formatDate } from '@/lib/format';
import { DATA_SOURCES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Data Sources',
  description: 'All data sources used by LocalLedger - official public federal databases only.',
};

function loadCatalog() {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'metadata-catalog.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

interface CatalogEntry {
  id: string;
  name: string;
  source: string;
  file: string;
  lastFetchedAt: string;
}

export default function SourcesPage() {
  const catalog = loadCatalog();
  const datasets: CatalogEntry[] = catalog?.datasets ?? [];

  return (
    <>
      <Hero
        tag="Transparency"
        headline="Data Sources"
        subheadline="Every data point in LocalLedger comes from an official public source. No estimates. No AI-generated values."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Official sources */}
        <section aria-label="Official data sources">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Official Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(DATA_SOURCES).map(source => (
              <div key={source.url} className="card p-5">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:underline font-semibold text-base"
                >
                  {source.name}
                </a>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  {source.description}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-muted mt-2 inline-block hover:text-brand-blue"
                >
                  {source.url}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Dataset catalog */}
        <section aria-label="Data file catalog">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Dataset Catalog</h2>
          <p className="text-text-secondary text-sm mb-6">
            Static JSON files are published at <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/data/processed/</code> and can be accessed directly.
          </p>

          {datasets.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="w-full text-sm" aria-label="Dataset catalog">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">Dataset</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">Source</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">File</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-secondary">Last Fetched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {datasets.map(ds => (
                    <tr key={ds.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-text-primary">{ds.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{ds.source}</td>
                      <td className="px-4 py-3">
                        <a
                          href={ds.file}
                          className="text-brand-blue hover:underline font-mono text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ds.file}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(ds.lastFetchedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card p-6 text-center text-text-muted">
              <p>Run <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">pnpm data:fetch</code> to generate the dataset catalog.</p>
            </div>
          )}
        </section>

        {/* Data integrity */}
        <section aria-label="Data integrity">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Data Integrity Guarantee</h2>
          <div className="card p-6">
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Every displayed metric includes source name, URL, dataset, geography, date, and last fetched timestamp.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Build process validates all data files - missing citations or invalid values fail the build.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No AI-generated, estimated, fabricated, or invented data values - ever.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Computed scores (Local Economy Score, Value Score, Slowdown Risk) have transparent formulas in <a href="/methodology/" className="text-brand-blue hover:underline">Methodology</a>.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unavailable data shows &ldquo;Data unavailable&rdquo; - never a fallback value or estimate.
              </li>
            </ul>
          </div>
        </section>

        <div className="source-strip flex-wrap gap-3">
          {Object.values(DATA_SOURCES).map(s => (
            <SourceBadge key={s.url} name={s.name} url={s.url} dataset={s.description} />
          ))}
        </div>
      </div>
    </>
  );
}
