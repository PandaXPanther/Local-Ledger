import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { formatMetric, getCounties, getMetros, getStates, topBy } from '@/lib/nationalData';
import { PRESETS } from '@/lib/sim/presets';
import { PARAM_DEFS } from '@/lib/sim/params';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Local Economy Data Dashboard',
  description:
    'Free dashboards of official economic data for every U.S. state, county, and metro: jobs, income, housing, college ROI, and federal spending. Plus an interactive economy simulator for learning how policy works.',
  path: '/',
  ogDescription:
    'Official economic data for every U.S. state, county, and metro, with sources on every figure. Plus an economy simulator you can run yourself.',
});

const FEATURE_CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Economic Dashboards',
    desc: 'State and county-level scorecards with unemployment, income, housing, and labor data from BLS, FRED, and Census.',
    href: '/states/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'College ROI',
    desc: 'College Scorecard data: net price, graduation rates, earnings, and debt-to-income ratios across U.S. institutions.',
    href: '/rankings/most-affordable-college-states/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Federal Spending',
    desc: 'USAspending.gov data on federal grants, contracts, and loans flowing across U.S. counties.',
    href: '/rankings/federal-spending-per-capita/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Recession Radar',
    desc: 'State slowdown risk views based on public historical data. Not financial advice.',
    href: '/states/',
  },
];

const FEATURED_SCENARIOS = ['hyperinflation', 'crash-1929', 'stagflation', 'housing-2008'];

export default function HomePage() {
  const states = getStates();
  const counties = getCounties();
  const metros = getMetros();
  const topStates = topBy(states, state => state.localEconomyScore.value, 5);
  const browseStates = topBy(states, state => state.localEconomyScore.value, 16);
  const featured = PRESETS.filter(preset => FEATURED_SCENARIOS.includes(preset.id));
  const statCards = [
    { value: formatMetric(states.length, 'count'), label: 'states tracked', icon: 'M3 7.5L12 3l9 4.5-9 4.5L3 7.5zm0 5L12 17l9-4.5M3 17.5L12 22l9-4.5' },
    { value: formatMetric(counties.length, 'count'), label: 'counties indexed', icon: 'M12 21s7-4.438 7-11a7 7 0 10-14 0c0 6.563 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z' },
    { value: formatMetric(metros.length, 'count'), label: 'metro previews', icon: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 9h.01M12 9h.01M16 9h.01' },
    { value: '0', label: 'fabricated data points', icon: 'M9 12l2 2 4-4m5.5-4.5A11 11 0 0112 21.5 11 11 0 013.5 5.5 11 11 0 0012 2a11 11 0 008.5 3.5z' },
  ];

  return (
    <>
      <Hero
        tag="Every state. Every county."
        headline="Your local economy, in plain numbers."
        subheadline={SITE_DESCRIPTION}
        primaryCta={{ label: 'Browse States', href: '/states/' }}
        secondaryCta={{ label: 'Try the Simulator', href: '/simulator/' }}
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

      {/* Stat cards */}
      <section className="border-b border-rule bg-background" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <div
                key={card.label}
                className="group rounded-lg border border-border bg-surface p-5 text-center shadow-[0_1px_0_rgba(31,36,33,0.08)] transition-all hover:-translate-y-0.5 hover:border-rule hover:shadow-[0_18px_45px_rgba(31,36,33,0.08)]"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/10 transition-colors group-hover:bg-accent group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={card.icon} />
                  </svg>
                </div>
                <div className="mb-1 font-mono text-4xl font-extrabold text-ink">{card.value}</div>
                <div className="text-sm font-medium leading-tight text-text-secondary sm:text-base">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data integrity banner */}
      <section className="bg-ink py-4 text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-center">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Every metric cites its source
            </span>
            <span className="hidden text-background/40 sm:block">·</span>
            <span>No AI-generated data</span>
            <span className="hidden text-background/40 sm:block">·</span>
            <span>Build fails if citations are missing</span>
            <span className="hidden text-background/40 sm:block">·</span>
            <span>Made-up numbers live only in the simulator</span>
          </div>
        </div>
      </section>

      {/* Economy simulator */}
      <section className="border-b border-rule bg-canvas" aria-label="Economy simulator">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="badge-blue mb-4">Interactive</span>
              <h2 className="font-display text-4xl font-bold text-ink sm:text-5xl">
                An economy you can crash.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
                A small model economy that runs in your browser. You get {PARAM_DEFS.length} dials:
                interest rates, taxes, tariffs, money printing, the gold standard, bank bailouts.
                Ten million simulated people live with whatever you decide. Load 1929 or Weimar
                Germany and see if you can do better than history did.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
                It is the one place on this site where the numbers are not real. That is the point.
                Being wrong here is free.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/simulator/" className="btn-primary">
                  Open the Simulator
                </Link>
                <Link href="/simulator/#how-it-works" className="btn-secondary">
                  How it works
                </Link>
              </div>
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              {featured.map(preset => (
                <Link key={preset.id} href={`/simulator/?scenario=${preset.id}`} className="card group p-5">
                  <div className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                    {preset.era}
                  </div>
                  <div className="mt-1.5 font-display text-lg font-bold text-ink group-hover:text-accent">
                    {preset.name}
                  </div>
                  <div className="mt-1 text-sm leading-snug text-text-secondary">{preset.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Dashboard features">
        <div className="text-center mb-10">
          <h2 className="mb-3 font-display text-4xl font-bold text-ink">What LocalLedger tracks</h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Official labor, income, housing, education, and public finance data - presented clearly.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map(card => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-[0_1px_0_rgba(31,36,33,0.08)] transition-all hover:-translate-y-1 hover:border-rule hover:shadow-[0_22px_55px_rgba(31,36,33,0.1)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-ember to-data opacity-80" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/10 transition-all group-hover:scale-105 group-hover:bg-accent group-hover:text-white">
                {card.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by state */}
      <section className="border-y border-rule bg-canvas py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-3xl font-bold text-ink">Browse by state</h2>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {browseStates.map(state => (
              <Link
                key={state.slug}
                href={`/states/${state.slug}/`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3.5 py-2 text-sm font-semibold text-text-secondary shadow-sm backdrop-blur transition-all hover:scale-[1.03] hover:border-accent/35 hover:bg-accent-soft hover:text-accent hover:shadow-md sm:px-4"
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
                  className="group block rounded-lg border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rule hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 font-semibold text-text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas font-mono text-xs font-bold text-text-muted group-hover:bg-accent-soft group-hover:text-accent">
                        #{index + 1}
                      </span>
                      {state.name}
                    </span>
                    <span className="font-mono font-bold text-accent">{formatMetric(state.localEconomyScore.value, 'score')}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-ember"
                      style={{ width: `${Math.min(100, Math.max(0, state.localEconomyScore.value ?? 0))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(31,36,33,0.05)]">
            <div className="rounded-xl bg-canvas p-4">
              <div className="grid grid-cols-10 gap-1.5">
                {states.slice(0, 50).map(state => {
                  const score = state.localEconomyScore.value ?? 0;
                  const bg = score > 65
                    ? 'bg-accent hover:bg-[#1A4F37]'
                    : score > 55
                      ? 'bg-ember hover:bg-[#9A5124]'
                      : 'bg-[#C8BFA8] hover:bg-[#B5AA90]';
                  return (
                    <Link
                      key={state.slug}
                      href={`/states/${state.slug}/`}
                      title={`${state.name}: ${score > 0 ? score.toFixed(1) : 'N/A'}`}
                      aria-label={`${state.name} - Local Economy Score: ${score > 0 ? score.toFixed(1) : 'N/A'}`}
                      className={`group relative aspect-square rounded-md ${bg} transition-all duration-150 hover:z-10 hover:scale-110 hover:shadow-md focus-visible:z-10 focus-visible:scale-110`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] font-semibold text-canvas shadow-lg">
                          {state.name}
                          <span className="ml-1 font-mono text-accent-soft">{score > 0 ? score.toFixed(0) : 'N/A'}</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">50 states tracked - each tile links to that state&apos;s dashboard. Color = local economy score (green = strong, amber = moderate, tan = developing).</p>
          </div>
        </div>
      </section>

      {/* Data sources strip */}
      <section className="border-t border-rule bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 text-center">
            Official Data Sources
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
                className="editorial-link transition-colors hover:text-accent"
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
