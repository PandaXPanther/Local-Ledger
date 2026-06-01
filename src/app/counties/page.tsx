import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { getCounties, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = {
  title: 'County Economic Dashboards',
  description: 'Find county economic indicators for income, population, housing, and Local Economy Score from official Census ACS data.',
  alternates: { canonical: '/counties/' },
};

export default function CountiesPage() {
  const counties = topBy(getCounties(), county => county.population, 300);
  return (
    <>
      <Hero tag="Counties" headline="County economic dashboards" subheadline="Search county-level income, population, housing, and Local Economy Score from official public data." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {counties.map(county => (
            <Link key={county.fips} href={`/counties/${county.stateSlug}/${county.slug}/`} className="card p-5 hover:shadow-md">
              <h2 className="font-semibold text-text-primary">{county.county}</h2>
              <p className="text-sm text-text-secondary">{county.state}</p>
              <p className="mt-3 text-sm">Population {formatMetric(county.population, 'persons')}</p>
              <p className="text-sm">Score {formatMetric(county.localEconomyScore, 'score')}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
