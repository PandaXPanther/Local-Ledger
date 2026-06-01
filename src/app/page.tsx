import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { formatMetric, getCounties, getMetros, getStates, topBy } from '@/lib/nationalData';

export const metadata: Metadata = {
  title: 'LocalLedger - Public Economic Intelligence for Every Community',
  description: SITE_DESCRIPTION,
};

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

export default function HomePage() {
  const states = getStates();
  const counties = getCounties();
  const metros = getMetros();
  const topStates = topBy(states, state => state.localEconomyScore.value, 5);
  const browseStates = topBy(states, state => state.localEconomyScore.value, 16);
  const statCards = [
    { value: formatMetric(states.length, 'count'), label: 'states tracked', icon: 'M3 7.5L12 3l9 4.5-9 4.5L3 7.5zm0 5L12 17l9-4.5M3 17.5L12 22l9-4.5' },
    { value: formatMetric(counties.length, 'count'), label: 'counties indexed', icon: 'M12 21s7-4.438 7-11a7 7 0 10-14 0c0 6.563 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z' },
    { value: formatMetric(metros.length, 'count'), label: 'metro previews', icon: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 9h.01M12 9h.01M16 9h.01' },
    { value: '0', label: 'fabricated data points', icon: 'M9 12l2 2 4-4m5.5-4.5A11 11 0 0112 21.5 11 11 0 013.5 5.5 11 11 0 0012 2a11 11 0 008.5 3.5z' },
  ];

  return (
    <>
      <Hero
        tag="Nationwide Economic Observatory"
        headline="Public economic intelligence for every community."
        subheadline={SITE_DESCRIPTION}
        primaryCta={{ label: 'Browse States', href: '/states/' }}
        secondaryCta={{ label: 'View Methodology', href: '/methodology/' }}
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
      <section className="bg-white border-b border-border" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <div
                key={card.label}
                className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 text-center shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:ring-cyan-300/60"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 transition-colors group-hover:bg-cyan-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={card.icon} />
                  </svg>
                </div>
                <div className="mb-1 bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-4xl font-extrabold text-transparent">{card.value}</div>
                <div className="text-sm font-medium text-text-secondary">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data integrity banner */}
      <section className="bg-gradient-to-r from-brand-teal to-brand-blue text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-center">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Every metric cites its source
            </span>
            <span className="hidden sm:block text-white/40">·</span>
            <span>No AI-generated data values</span>
            <span className="hidden sm:block text-white/40">·</span>
            <span>Build fails if citations are missing</span>
            <span className="hidden sm:block text-white/40">·</span>
            <span>Official public sources only</span>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Dashboard features">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">What LocalLedger tracks</h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Official labor, income, housing, education, and public finance data - presented clearly.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 opacity-70" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-all group-hover:scale-105 group-hover:bg-cyan-50 group-hover:text-cyan-700">
                {card.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by state */}
      <section className="border-t border-border bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Browse by state</h2>
          <div className="flex flex-wrap gap-3">
            {browseStates.map(state => (
              <Link
                key={state.slug}
                href={`/states/${state.slug}/`}
                className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition-all hover:scale-[1.03] hover:border-cyan-300 hover:bg-cyan-50/80 hover:text-brand-blue hover:shadow-md"
              >
                {state.name}
                <svg className="ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-border py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <p className="section-label mb-3">National preview</p>
            <h2 className="text-2xl font-bold text-text-primary">Top state economy scores</h2>
            <div className="mt-6 space-y-3">
              {topStates.map((state, index) => (
                <Link
                  key={state.slug}
                  href={`/states/${state.slug}/`}
                  className="group block rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 font-semibold text-text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-cyan-100 group-hover:text-cyan-700">
                        #{index + 1}
                      </span>
                      {state.name}
                    </span>
                    <span className="font-bold text-brand-blue">{formatMetric(state.localEconomyScore.value, 'score')}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"
                      style={{ width: `${Math.min(100, Math.max(0, state.localEconomyScore.value ?? 0))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-slate-50 p-6">
            <svg viewBox="0 0 420 250" className="h-auto w-full" role="img" aria-label="United States data coverage preview">
              <rect x="0" y="0" width="420" height="250" rx="18" fill="#f8fafc" />
              {states.slice(0, 50).map((state, index) => {
                const x = 24 + (index % 10) * 38;
                const y = 30 + Math.floor(index / 10) * 38;
                const score = state.localEconomyScore.value ?? 0;
                const fill = score > 65 ? '#0f766e' : score > 55 ? '#14b8a6' : '#bfdbfe';
                return <rect key={state.slug} x={x} y={y} width="28" height="28" rx="6" fill={fill}><title>{state.name}</title></rect>;
              })}
            </svg>
            <p className="mt-4 text-sm text-text-secondary">Lightweight coverage map: each tile is a state generated from the national static data index.</p>
          </div>
        </div>
      </section>

      {/* Data sources strip */}
      <section className="bg-white border-t border-border py-8">
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
                className="hover:text-brand-blue transition-colors"
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
