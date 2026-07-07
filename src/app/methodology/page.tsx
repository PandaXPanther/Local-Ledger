import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { LOCAL_ECONOMY_SCORE_WEIGHTS, TREND_THRESHOLDS, RECESSION_THRESHOLDS } from '@/lib/constants';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Methodology',
  description: 'How LocalLedger computes Local Economy Score, slowdown risk, college ROI, federal spending per capita, and data availability.',
  path: '/methodology/',
});

export default function MethodologyPage() {
  return (
    <>
      <Hero
        tag="Transparency"
        headline="Methodology"
        subheadline="Every derived metric is documented here. No black boxes. Computed scores are transparent composites of official public data."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Data integrity */}
        <section aria-label="Data integrity principles">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Data Integrity Rules</h2>
          <div className="card p-6 space-y-4">
            {[
              {
                rule: 'No fabricated values',
                desc: 'LocalLedger displays only values sourced from official public databases (FRED, BLS, Census, BEA, College Scorecard, USAspending). If data is unavailable, it shows "Data unavailable" - never an AI-generated, unsourced, or model-imputed number.',
              },
              {
                rule: 'Every metric cites its source',
                desc: 'Every displayed value includes: source name, source URL, dataset/series ID, geography, date, and last fetched timestamp.',
              },
              {
                rule: 'Build fails on missing citations',
                desc: 'The validation script (pnpm data:validate) exits with an error code if any data point is missing a source URL, last updated timestamp, or methodology note for computed scores.',
              },
              {
                rule: 'No impossible values',
                desc: 'NaN, Infinity, negative unemployment rates, and similar impossible values trigger a build failure.',
              },
              {
                rule: 'No mock/demo strings in production',
                desc: '"Lorem ipsum", "placeholder", "sample data", "demo data", "fabricated", "random", "dummy" are forbidden in production data files.',
              },
            ].map(item => (
              <div key={item.rule} className="border-l-4 border-accent pl-4">
                <p className="font-semibold text-text-primary">{item.rule}</p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Local Economy Score */}
        <section aria-label="Local Economy Score methodology">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Local Economy Score (0-100)</h2>
          <MethodologyCallout
            type="info"
            note="The Local Economy Score is a weighted composite of five dimensions. Each dimension is normalized to a 0-100 sub-score using the formulas below. Missing data reduces the effective weight proportionally - no dimension is fabricated, AI-generated, or model-imputed."
          />

          <div className="mt-6 card overflow-hidden">
            <table className="w-full text-sm" aria-label="Local Economy Score weights">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Dimension</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">Weight</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Data Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Normalization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-medium">Labor</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{LOCAL_ECONOMY_SCORE_WEIGHTS.labor}%</td>
                  <td className="px-4 py-3 text-text-secondary">FRED, BLS</td>
                  <td className="px-4 py-3 text-xs text-text-muted">Unemployment (70%): 0% = 100, 15%+ = 0. LFPR (30%): 80%+ = 100, 50% = 0.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Income</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{LOCAL_ECONOMY_SCORE_WEIGHTS.income}%</td>
                  <td className="px-4 py-3 text-text-secondary">FRED, Census ACS</td>
                  <td className="px-4 py-3 text-xs text-text-muted">Median HH income relative to CO median. 2× CO median = 100, 0 = 0.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Affordability</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{LOCAL_ECONOMY_SCORE_WEIGHTS.affordability}%</td>
                  <td className="px-4 py-3 text-text-secondary">Census ACS, Zillow (future)</td>
                  <td className="px-4 py-3 text-xs text-text-muted">Home price-to-income ratio. Ratio 2× = 100 (affordable), 10× = 0 (unaffordable).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Population Growth</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{LOCAL_ECONOMY_SCORE_WEIGHTS.population}%</td>
                  <td className="px-4 py-3 text-text-secondary">Census Bureau</td>
                  <td className="px-4 py-3 text-xs text-text-muted">YoY growth rate. +3%+ = 100, −2% = 0.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Fiscal</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{LOCAL_ECONOMY_SCORE_WEIGHTS.fiscal}%</td>
                  <td className="px-4 py-3 text-text-secondary">USAspending.gov</td>
                  <td className="px-4 py-3 text-xs text-text-muted">Federal spending per capita. $20k+ = 100, $0 = 0.</td>
                </tr>
              </tbody>
              <tfoot className="bg-canvas border-t border-border">
                <tr>
                  <td className="px-4 py-3 font-bold">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">100%</td>
                  <td colSpan={2} className="px-4 py-3 text-xs text-text-muted">
                    Missing dimensions reduce effective weight proportionally. Score is always between 0 and 100.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Slowdown Risk */}
        <section aria-label="Slowdown Risk Indicator methodology">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Slowdown Risk Indicator</h2>
          <MethodologyCallout
            type="warning"
            title="Disclaimer"
            note="This indicator is an educational model based on public historical data. It is not financial advice, investment advice, or a guaranteed forecast."
          />

          <div className="mt-6 space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-text-primary mb-3">Score Computation</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                The Slowdown Risk Score (0-100) is derived from the differential between Colorado and US unemployment rates,
                using the latest FRED observations. Additional indicators (housing permits, consumer confidence surveys)
                will be incorporated as data sources are confirmed and validated.
              </p>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>• <strong>CO unemployment significantly above US</strong> (+0.5pp): +30 risk points, trend = rising</li>
                <li>• <strong>CO unemployment near US</strong> (within ±0.5pp): +15 risk points, trend = stable</li>
                <li>• <strong>CO unemployment significantly below US</strong> (−0.5pp): −10 risk points, trend = falling</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-text-primary mb-3">Risk Level Thresholds</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="badge badge-green">Low</span>
                  <span className="text-text-secondary">Score 0-{RECESSION_THRESHOLDS.low.max}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-amber">Moderate</span>
                  <span className="text-text-secondary">Score {RECESSION_THRESHOLDS.moderate.min}-{RECESSION_THRESHOLDS.moderate.max}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-red">Elevated</span>
                  <span className="text-text-secondary">Score {RECESSION_THRESHOLDS.elevated.min}-100</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-text-primary mb-3">Trend Thresholds</h3>
              <p className="text-sm text-text-secondary">
                Rising: change &gt; +{TREND_THRESHOLDS.rising}% · Stable: between {TREND_THRESHOLDS.falling}% and +{TREND_THRESHOLDS.rising}% · Falling: change &lt; {TREND_THRESHOLDS.falling}%
              </p>
            </div>
          </div>
        </section>

        {/* Housing Pressure Score */}
        <section aria-label="Housing Pressure Score methodology">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Housing Pressure Score (0-100)</h2>
          <div className="card p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              The Housing Pressure Score measures the ratio of median home value to median household income
              (price-to-income ratio). Higher scores indicate more housing cost pressure.
            </p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Price-to-income ratio 2× → Score 0 (very affordable)</li>
              <li>• Price-to-income ratio 6× → Score 50 (moderate pressure)</li>
              <li>• Price-to-income ratio 10× → Score 100 (severe pressure)</li>
            </ul>
            <p className="text-xs text-text-muted mt-4">Sources: Census ACS median home value and median household income.</p>
          </div>
        </section>

        {/* College ROI */}
        <section aria-label="College ROI methodology">
          <h2 className="text-2xl font-bold text-text-primary mb-4">College ROI Value Score</h2>
          <MethodologyCallout
            type="disclaimer"
            note="College ROI metrics are simplified indicators based on public data. They should not be treated as a complete measure of educational quality, fit, or long-term outcomes."
          />
          <div className="mt-4 card p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Value Score (0-100) is computed from College Scorecard data:
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Median Earnings 10yr: 40% weight (normalized: $100k = 100)</li>
              <li>• Graduation Rate: 30% weight (direct percentage, ×100)</li>
              <li>• Net Price (inverse): 20% weight ($0 = 100, $50k = 0)</li>
              <li>• Debt-to-Earnings (inverse): 10% weight</li>
            </ul>
            <p className="text-xs text-text-muted mt-4">Suppressed Scorecard values reduce effective weight. All source data from College Scorecard API.</p>
          </div>
        </section>

        {/* Data sources */}
        <section aria-label="Data sources used">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Data Sources</h2>
          <div className="card p-6">
            <p className="text-sm text-text-secondary mb-4">LocalLedger uses only official public data sources:</p>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  Federal Reserve Economic Data (FRED)
                </a> - unemployment rates, GDP, income, population
              </li>
              <li>
                <a href="https://www.bls.gov/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  Bureau of Labor Statistics (BLS)
                </a> - labor force statistics, detailed employment
              </li>
              <li>
                <a href="https://www.census.gov/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  U.S. Census Bureau (ACS)
                </a> - population, income, housing
              </li>
              <li>
                <a href="https://www.bea.gov/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  Bureau of Economic Analysis (BEA)
                </a> - regional GDP, personal income
              </li>
              <li>
                <a href="https://collegescorecard.ed.gov/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  College Scorecard (U.S. Dept. of Education)
                </a> - institutional outcomes, costs, earnings
              </li>
              <li>
                <a href="https://www.usaspending.gov/" target="_blank" rel="noopener noreferrer" className="text-accent editorial-link font-medium">
                  USAspending.gov
                </a> - federal award spending by geography
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
