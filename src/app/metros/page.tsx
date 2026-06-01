import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { getMetros, formatMetric } from '@/lib/nationalData';

export const metadata: Metadata = {
  title: 'Metro Economic Dashboards',
  description: 'Browse major U.S. metro economic dashboards with Census ACS population, income, and housing indicators.',
  alternates: { canonical: '/metros/' },
};

export default function MetrosPage() {
  return (
    <>
      <Hero tag="Metros" headline="Major metro previews" subheadline="Lightweight metro pages using large Census place indicators for fast national coverage." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {getMetros().map(metro => (
          <Link key={metro.slug} href={`/metros/${metro.slug}/`} className="card p-5 hover:shadow-md">
            <h2 className="font-semibold text-text-primary">{metro.name}</h2>
            <p className="text-sm text-text-secondary">{metro.state}</p>
            <p className="mt-3 text-sm">Population {formatMetric(metro.population, 'persons')}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
