import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getMetros, getStateBundle, getStates, formatMetric } from '@/lib/nationalData';

interface Props {
  params: { stateSlug: string };
}

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return { title: `${bundle.state.name} Cities`, description: `Major city and metro indicators for ${bundle.state.name}.`, alternates: { canonical: `/states/${bundle.state.slug}/cities/` } };
}

export default function StateCitiesPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const metros = getMetros().filter(metro => metro.stateSlug === params.stateSlug);

  return (
    <>
      <Hero tag={bundle.state.abbreviation} headline={`${bundle.state.name} cities`} subheadline="Major Census place indicators used as lightweight metro previews." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {metros.map(metro => (
          <Link key={metro.slug} href={`/metros/${metro.slug}/`} className="card p-5 hover:shadow-md">
            <h2 className="font-semibold text-text-primary">{metro.name}</h2>
            <p className="mt-2 text-sm text-text-secondary">Population {formatMetric(metro.population, 'persons')}</p>
            <p className="text-sm text-text-secondary">Median income {formatMetric(metro.medianHouseholdIncome, 'USD')}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
