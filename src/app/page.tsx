import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { COLORADO_CITIES, SITE_DESCRIPTION } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'LocalLedger - Public Economic Intelligence for Every Community',
  description: SITE_DESCRIPTION,
};

const STAT_CARDS = [
  { value: '5', label: 'Colorado cities tracked' },
  { value: '64', label: 'Colorado counties planned' },
  { value: '100%', label: 'Official datasets only' },
  { value: '0', label: 'Fabricated data points' },
];

const FEATURE_CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Economic Dashboards',
    desc: 'City-level scorecards with unemployment, income, housing, and labor data from BLS, FRED, and Census.',
    href: '/colorado/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'College ROI',
    desc: 'College Scorecard data: net price, graduation rates, earnings, and debt-to-income ratios for Colorado institutions.',
    href: '/colorado/college-roi/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Federal Spending',
    desc: 'USAspending.gov data on federal grants, contracts, and loans flowing into Colorado communities.',
    href: '/colorado/federal-spending/',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Recession Radar',
    desc: 'Educational slowdown risk indicator based on public historical data. Not financial advice.',
    href: '/colorado/recession-radar/',
  },
];

export default function HomePage() {
  return (
    <>
      <Hero
        tag="Colorado Economic Observatory"
        headline="Public economic intelligence for every community."
        subheadline={SITE_DESCRIPTION}
        primaryCta={{ label: 'Explore Colorado', href: '/colorado/' }}
        secondaryCta={{ label: 'View Methodology', href: '/methodology/' }}
      />

      {/* Stat cards */}
      <section className="bg-white border-b border-border" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STAT_CARDS.map(card => (
              <div key={card.label} className="text-center">
                <div className="text-4xl font-extrabold text-brand-blue mb-1">{card.value}</div>
                <div className="text-sm text-text-secondary">{card.label}</div>
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
            <Link key={card.href} href={card.href} className="card p-6 hover:shadow-md transition-shadow group">
              <div className="text-brand-blue mb-3 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Colorado cities quick links */}
      <section className="bg-gray-50 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Colorado Cities</h2>
          <div className="flex flex-wrap gap-3">
            {COLORADO_CITIES.map(city => (
              <Link
                key={city.href}
                href={city.href}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-border text-sm font-medium text-text-secondary hover:border-brand-blue hover:text-brand-blue hover:shadow-sm transition-all"
              >
                {city.label}
                <svg className="ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
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
