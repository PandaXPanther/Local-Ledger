import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { formatMetric, getCounties, getMetros, getStates, topBy } from '@/lib/nationalData';
import { PRESETS } from '@/lib/sim/presets';
import { PARAM_DEFS } from '@/lib/sim/params';

export const metadata: Metadata = {
  title: 'Economy Simulator and Local Economic Data',
  description:
    'Free economics education platform: an interactive economy simulator with 41 policy dials and 12 historical scenarios, plus cited official economic data for every U.S. state, county, and metro.',
  alternates: { canonical: '/' },
};

const LEDGER_CARDS = [
  {
    title: 'Economic Dashboards',
    desc: 'State and county scorecards with unemployment, income, housing, and labor data from BLS, FRED, and Census.',
    href: '/states/',
    tag: 'ALL 50 STATES',
  },
  {
    title: 'College ROI',
    desc: 'College Scorecard data: net price, graduation rates, earnings, and debt-to-income ratios across U.S. institutions.',
    href: '/rankings/most-affordable-college-states/',
    tag: 'SCORECARD',
  },
  {
    title: 'Federal Spending',
    desc: 'USAspending.gov data on federal grants, contracts, and loans flowing across U.S. counties.',
    href: '/rankings/federal-spending-per-capita/',
    tag: 'USASPENDING',
  },
  {
    title: 'Recession Radar',
    desc: 'State slowdown risk views based on public historical data. Not financial advice.',
    href: '/states/',
    tag: 'RISK VIEW',
  },
];

const FEATURED_SCENARIOS = ['hyperinflation', 'crash-1929', 'stagflation', 'housing-2008', 'gold-deflation', 'trade-war'];

export default function HomePage() {
  const states = getStates();
  const counties = getCounties();
  const metros = getMetros();
  const topStates = topBy(states, state => state.localEconomyScore.value, 5);
  const browseStates = topBy(states, state => state.localEconomyScore.value, 16);
  const featured = PRESETS.filter(preset => FEATURED_SCENARIOS.includes(preset.id));
  const statCards = [
    { value: formatMetric(states.length, 'count'), label: 'states tracked' },
    { value: formatMetric(counties.length, 'count'), label: 'counties indexed' },
    { value: formatMetric(metros.length, 'count'), label: 'metro previews' },
    { value: '0', label: 'fabricated data points' },
  ];

  return (
    <>
      <Hero
        tag="Data + Simulation"
        headline="Real data for every county. And an economy you can crash."
        subheadline={SITE_DESCRIPTION}
        primaryCta={{ label: 'Enter the Simulator', href: '/simulator/' }}
        secondaryCta={{ label: 'Browse the Ledger', href: '/states/' }}
        pulseTitle="National coverage"
        pulseStatus="Static export"
        sourceCards={[
          { label: 'States', value: formatMetric(states.length, 'count'), detail: 'State dashboards generated from official data.', status: 'pass' },
          { label: 'Counties', value: formatMetric(counties.length, 'count'), detail: 'County records indexed for search and rankings.', status: 'pass' },
          { label: 'Metros', value: formatMetric(metros.length, 'count'), detail: 'Major place previews published as static routes.', status: 'pass' },
          { label: 'Integrity', value: '0 fabricated', detail: 'Unavailable values stay explicit and sourced.', status: 'pass' },
        ]}
        validationItems={[
          { label: 'State index', shortLabel: 'States', status: states.length > 0 ? 'pass' : 'fail', detail: `${states.length} states loaded from processed JSON.` },
          { label: 'County index', shortLabel: 'Counties', status: counties.length > 0 ? 'pass' : 'fail', detail: `${counties.length} counties loaded from processed JSON.` },
          { label: 'Metro index', shortLabel: 'Metros', status: metros.length > 0 ? 'pass' : 'fail', detail: `${metros.length} metros loaded from processed JSON.` },
          { label: 'Top rankings', shortLabel: 'Top', status: topStates.length > 0 ? 'pass' : 'fail', detail: `${topStates.length} ranked states available.` },
          { label: 'Static data', shortLabel: 'Static', status: 'pass', detail: 'Next.js imports processed data during static build.' },
          { label: 'Citations', shortLabel: 'Cites', status: 'pass', detail: 'Data validation checks metric provenance.' },
        ]}
      />

      {/* The Machine: flagship band */}
      <section className="ledger-ruling-dark border-b border-machine-line bg-machine text-cream" aria-label="Economy simulator">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-bright">
                The Machine / flagship
              </p>
              <h2 className="mt-3 font-display text-4xl font-black leading-[1.02] text-cream sm:text-5xl">
                A ten-million-citizen economy you are allowed to destroy.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/70">
                A full macroeconomic model in your browser: jobs, banks, bonds, bubbles, tariffs,
                mortgages, the gold standard, bailouts and the moral hazard they buy. Turn any of
                41 dials while it runs and watch ten million simulated citizens live with your
                policy. Then load 1923 Germany or 1929 America and try to do better than history did.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cream/50">
                <span>{PARAM_DEFS.length} dials</span>
                <span>{PRESETS.length} scenarios</span>
                <span>10,000,000 citizens</span>
                <span className="text-accent-bright">0 safety interlocks</span>
              </div>
              <div className="mt-8">
                <Link href="/simulator/" className="btn-machine px-7 py-3 text-base">
                  Start the Machine
                </Link>
              </div>
            </div>
            <div className="grid content-start gap-2 sm:grid-cols-2">
              {featured.map(preset => (
                <Link
                  key={preset.id}
                  href={`/simulator/?scenario=${preset.id}`}
                  className="hud-frame rounded-[10px] border border-machine-line bg-machine-panel p-4 transition-colors hover:border-accent-bright/60"
                >
                  <div className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-cream/45">
                    {preset.era}
                  </div>
                  <div className="mt-1 font-display text-lg font-bold text-cream">{preset.name}</div>
                  <div className="mt-1 text-[0.75rem] leading-snug text-cream/55">{preset.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-b border-rule bg-background" aria-label="Key statistics">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map(card => (
              <div key={card.label} className="card p-5">
                <div className="font-mono text-3xl font-bold tnum text-ink">{card.value}</div>
                <div className="mt-1 text-sm font-medium text-text-secondary">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrity strip */}
      <section className="border-b border-rule bg-canvas py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-2 text-center font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-secondary sm:flex-row sm:gap-4">
            <span>Every real metric cites its source</span>
            <span className="hidden text-rule sm:block">/</span>
            <span>No AI-generated data</span>
            <span className="hidden text-rule sm:block">/</span>
            <span>Build fails if citations are missing</span>
            <span className="hidden text-rule sm:block">/</span>
            <span className="text-accent-dark">Simulated numbers live only in the Machine</span>
          </div>
        </div>
      </section>

      {/* The Ledger: real-data tools */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Data dashboards">
        <p className="section-label">The Ledger / real data</p>
        <h2 className="mt-2 font-display text-4xl font-bold text-ink">What LocalLedger tracks</h2>
        <p className="mt-3 max-w-xl text-text-secondary">
          Official labor, income, housing, education, and public finance data, presented with the
          source attached to every number.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEDGER_CARDS.map(card => (
            <Link key={card.href + card.title} href={card.href} className="card group p-6">
              <div className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-accent-dark">
                {card.tag}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-ink group-hover:text-accent-dark">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by state */}
      <section className="border-y border-rule bg-canvas py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-3xl font-bold text-ink">Browse by state</h2>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {browseStates.map(state => (
              <Link
                key={state.slug}
                href={`/states/${state.slug}/`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-accent/50 hover:text-accent-dark sm:px-4"
              >
                <span className="truncate">{state.name}</span>
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <p className="section-label mb-3">National preview</p>
            <h2 className="font-display text-3xl font-bold text-ink">Top state economy scores</h2>
            <div className="mt-6 space-y-3">
              {topStates.map((state, index) => (
                <Link
                  key={state.slug}
                  href={`/states/${state.slug}/`}
                  className="card group block p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 font-semibold text-text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-canvas font-mono text-xs font-bold text-text-muted group-hover:text-accent-dark">
                        {index + 1}
                      </span>
                      {state.name}
                    </span>
                    <span className="font-mono font-bold tnum text-accent-dark">{formatMetric(state.localEconomyScore.value, 'score')}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-sm bg-canvas">
                    <div
                      className="h-full rounded-sm bg-accent"
                      style={{ width: `${Math.min(100, Math.max(0, state.localEconomyScore.value ?? 0))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="rounded-md bg-canvas p-4">
              <div className="grid grid-cols-10 gap-1.5">
                {states.slice(0, 50).map(state => {
                  const score = state.localEconomyScore.value ?? 0;
                  const bg = score > 65
                    ? 'bg-accent hover:bg-accent-dark'
                    : score > 55
                      ? 'bg-ember hover:bg-[#6E5518]'
                      : 'bg-rule hover:bg-[#B0A17E]';
                  return (
                    <Link
                      key={state.slug}
                      href={`/states/${state.slug}/`}
                      title={`${state.name}: ${score > 0 ? score.toFixed(1) : 'N/A'}`}
                      aria-label={`${state.name} - Local Economy Score: ${score > 0 ? score.toFixed(1) : 'N/A'}`}
                      className={`group relative aspect-square rounded-sm ${bg} transition-colors duration-150 hover:z-10 focus-visible:z-10`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-[10px] font-semibold text-cream shadow-lg">
                          {state.name}
                          <span className="ml-1 text-accent-bright">{score > 0 ? score.toFixed(0) : 'N/A'}</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">50 states tracked. Each tile links to that state&apos;s dashboard. Color = local economy score (orange = strong, brass = moderate, tan = developing).</p>
          </div>
        </div>
      </section>

      {/* Data sources strip */}
      <section className="border-t border-rule bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-4 text-center">
            Official data sources
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            {[
              { label: 'FRED (Federal Reserve)', url: 'https://fred.stlouisfed.org/' },
              { label: 'Bureau of Labor Statistics', url: 'https://www.bls.gov/' },
              { label: 'U.S. Census Bureau', url: 'https://www.census.gov/' },
              { label: 'Bureau of Economic Analysis', url: 'https://www.bea.gov/' },
              { label: 'College Scorecard', url: 'https://collegescorecard.ed.gov/' },
              { label: 'USAspending.gov', url: 'https://www.usaspending.gov/' },
            ].map(s => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link transition-colors hover:text-accent-dark"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
