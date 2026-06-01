import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero } from '@/components/Hero';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { SourceBadge } from '@/components/SourceBadge';
import { LastUpdated } from '@/components/LastUpdated';
import CollegeTable from './CollegeTable';

export const metadata: Metadata = {
  title: 'Colorado College ROI Dashboard',
  description: 'Net price, graduation rates, earnings, and debt metrics for Colorado colleges from the U.S. College Scorecard.',
};

interface CollegeData {
  _meta: {
    description: string;
    generatedAt: string;
    source: { name: string; url: string; dataset: string; lastFetchedAt: string };
    disclaimer: string;
  };
  colleges: unknown;
}

function loadColleges(): CollegeData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'colleges.json');
  if (!existsSync(p)) return null;
  const data = JSON.parse(readFileSync(p, 'utf-8')) as CollegeData;
  if (Array.isArray(data.colleges)) {
    data.colleges = data.colleges.filter((college: Record<string, unknown>) => college.stateSlug === 'colorado');
  }
  return data;
}

export default function CollegeRoiPage() {
  const data = loadColleges();
  const generatedAt = data?._meta?.generatedAt ?? null;
  const disclaimer = data?._meta?.disclaimer ?? 'College ROI metrics are simplified indicators based on public data. They should not be treated as a complete measure of educational quality, fit, or long-term outcomes.';

  const colleges = Array.isArray(data?.colleges) ? data.colleges : [];
  const isAvailable = colleges.length > 0;

  return (
    <>
      <Hero
        tag="Colorado · College ROI"
        headline="Colorado College ROI"
        subheadline="Net price, graduation, earnings, and debt metrics for Colorado institutions - College Scorecard data only."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Required disclaimer */}
        <div className="mb-6">
          <MethodologyCallout
            type="disclaimer"
            title="Important disclaimer"
            note={disclaimer}
          />
        </div>

        {generatedAt && (
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <LastUpdated timestamp={generatedAt} label="Data pipeline run" />
          </div>
        )}

        {!isAvailable && (
          <div className="mb-6">
            <MethodologyCallout
              type="warning"
              title="College Scorecard data not loaded"
              note="College ROI data requires a College Scorecard API key (free from api.data.gov). Set COLLEGE_SCORECARD_API_KEY and re-run pnpm data:fetch. Data includes: net price, graduation rate, median earnings 10 years post-entry, and median debt."
            />
          </div>
        )}

        {/* Metrics explanation */}
        <section aria-label="Metrics explained" className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: 'Net Price',
                desc: 'Average annual cost after grants and scholarships. Source: College Scorecard.',
                source: 'avg_net_price',
              },
              {
                label: 'Graduation Rate',
                desc: 'Overall completion rate for first-time, full-time students. Source: College Scorecard.',
                source: 'rate_suppressed.overall',
              },
              {
                label: 'Median Earnings',
                desc: 'Median earnings of students 10 years after entry. Source: College Scorecard.',
                source: 'earnings.10_yrs_after_entry.median',
              },
              {
                label: 'Median Debt',
                desc: 'Median loan debt at graduation for completers. Source: College Scorecard.',
                source: 'aid.median_debt.completers',
              },
              {
                label: 'Debt-to-Earnings Ratio',
                desc: 'Computed: median debt ÷ annual earnings. Lower = better. Computed field.',
                source: 'Computed from Scorecard data',
              },
              {
                label: 'Value Score',
                desc: 'Composite of earnings, graduation rate, net price, and debt. 0-100, higher = better value. Computed field.',
                source: 'Computed from Scorecard data',
              },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <h3 className="font-semibold text-text-primary text-sm mb-1">{m.label}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{m.desc}</p>
                <p className="text-xs text-text-muted mt-2 font-mono">{m.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* College table */}
        <section aria-label="Colorado college data" className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Colorado Colleges & Universities</h2>
          {isAvailable ? (
            <CollegeTable colleges={colleges as Record<string, unknown>[]} />
          ) : (
            <div className="card p-8 text-center text-text-muted">
              <p>Data unavailable - set <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">COLLEGE_SCORECARD_API_KEY</code> and re-fetch.</p>
            </div>
          )}
        </section>

        <div className="source-strip flex-wrap gap-3">
          <SourceBadge
            name="College Scorecard (U.S. Dept. of Education)"
            url="https://collegescorecard.ed.gov/"
            dataset="College Scorecard API v1"
          />
          {generatedAt && <LastUpdated timestamp={generatedAt} />}
        </div>

        <MethodologyCallout
          type="disclaimer"
          title="Value Score methodology"
          note="Value Score (0-100) is a simplified composite: Earnings (40%) + Graduation Rate (30%) + Net Price inverse (20%) + Debt inverse (10%). All sub-scores normalized from College Scorecard data. This is an educational indicator only - not a comprehensive ranking. Suppressed data points reduce effective weight."
        />
      </div>
    </>
  );
}
