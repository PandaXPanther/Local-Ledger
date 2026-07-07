import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { SITE_URL } from '@/lib/constants';
import { localLedgerDatasetJsonLd, pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Public Economic Data API',
  description: 'Download free static JSON files for LocalLedger state, county, metro, college ROI, federal spending, and source metadata.',
  path: '/api/',
  keywords: ['free economic data API', 'public economic data JSON', 'county economic data download', 'state economic data download'],
});

const DATA_FILES = [
  {
    path: '/data/processed/states.json',
    name: 'State Dashboards',
    description: 'All U.S. state economic dashboards with income, labor, GDP, and federal spending metrics.',
    source: 'FRED, Census, BEA, USAspending',
  },
  {
    path: '/data/processed/counties.json',
    name: 'County Economic Indicators',
    description: 'County population, income, housing, and Local Economy Score records across the United States.',
    source: 'Census ACS',
  },
  {
    path: '/data/processed/metros.json',
    name: 'Metro Economic Indicators',
    description: 'Major U.S. metro and city population, income, and housing indicators.',
    source: 'Census ACS',
  },
  {
    path: '/data/processed/colorado-overview.json',
    name: 'Colorado Overview',
    description: 'Statewide unemployment, income, GDP, and population from FRED.',
    source: 'FRED',
  },
  {
    path: '/data/processed/cities.json',
    name: 'Colorado Cities',
    description: 'MSA-level economic data for Denver, Boulder, Colorado Springs, Fort Collins, Aurora.',
    source: 'FRED',
  },
  {
    path: '/data/processed/colleges.json',
    name: 'College ROI',
    description: 'Net price, graduation, earnings, debt data from College Scorecard.',
    source: 'College Scorecard',
  },
  {
    path: '/data/processed/federal-spending.json',
    name: 'Federal Spending',
    description: 'Federal award spending in Colorado from USAspending.gov.',
    source: 'USAspending',
  },
  {
    path: '/data/processed/recession-indicator.json',
    name: 'Slowdown Risk Indicator',
    description: 'Colorado Slowdown Risk Score and components.',
    source: 'FRED (computed)',
  },
  {
    path: '/data/processed/metadata-catalog.json',
    name: 'Metadata Catalog',
    description: 'Catalog of all datasets with fetch timestamps and source info.',
    source: 'LocalLedger',
  },
];

export default function ApiPage() {
  const datasetJsonLd = localLedgerDatasetJsonLd({
    name: 'LocalLedger public economic data files',
    description: 'Static JSON data files for public economic dashboards using official federal data sources.',
    url: '/api/',
    variableMeasured: ['state economic dashboard', 'county economic indicators', 'metro economic indicators', 'college ROI', 'federal spending'],
    distribution: DATA_FILES.map(file => ({
      name: file.name,
      contentUrl: file.path,
      description: file.description,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <Hero
        tag="Open Data"
        headline="API & Data Files"
        subheadline="All LocalLedger data is available as static JSON files. Free to access, sourced from official public databases."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="card p-5 bg-accent-soft/50 border-accent/20">
          <h2 className="font-semibold text-accent mb-2">Static JSON API</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            LocalLedger publishes all processed data as static JSON files. No authentication required.
            Base URL: <code className="text-xs bg-surface border border-border px-1.5 py-0.5 rounded">{SITE_URL}</code>
          </p>
        </div>

        <section aria-label="Available data files">
          <h2 className="text-xl font-bold text-text-primary mb-4">Available Files</h2>
          <div className="space-y-3">
            {DATA_FILES.map(file => (
              <div key={file.path} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-primary">{file.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{file.description}</p>
                    <span className="inline-block mt-2 text-xs text-text-muted">Source: {file.source}</span>
                  </div>
                  <a
                    href={file.path}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent-soft border border-accent/20 rounded-lg hover:bg-accent-soft transition-colors font-mono"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {file.path}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Usage notes">
          <h2 className="text-xl font-bold text-text-primary mb-4">Usage Notes</h2>
          <div className="card p-6">
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>• All files use a consistent schema with <code className="text-xs bg-canvas px-1 py-0.5 rounded">_meta</code> block including <code className="text-xs bg-canvas px-1 py-0.5 rounded">generatedAt</code>, description, and sources.</li>
              <li>• Data values of <code className="text-xs bg-canvas px-1 py-0.5 rounded">null</code> indicate unavailable data - not zero.</li>
              <li>• Every data point includes <code className="text-xs bg-canvas px-1 py-0.5 rounded">sourceName</code>, <code className="text-xs bg-canvas px-1 py-0.5 rounded">sourceUrl</code>, <code className="text-xs bg-canvas px-1 py-0.5 rounded">lastFetchedAt</code>.</li>
              <li>• Files are regenerated on each build. Cache with care - always check <code className="text-xs bg-canvas px-1 py-0.5 rounded">lastFetchedAt</code>.</li>
              <li>• If you use this data, please cite both LocalLedger and the underlying official source.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
