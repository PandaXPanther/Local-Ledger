import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getMetro, getMetros, formatMetric } from '@/lib/nationalData';

interface Props { params: { metroSlug: string } }

export function generateStaticParams() {
  return getMetros().map(metro => ({ metroSlug: metro.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const metro = getMetro(params.metroSlug);
  if (!metro) return {};
  return { title: `${metro.name} Metro Dashboard`, description: `Census ACS indicators for ${metro.name}, ${metro.state}.`, alternates: { canonical: `/metros/${metro.slug}/` } };
}

export default function MetroPage({ params }: Props) {
  const metro = getMetro(params.metroSlug);
  if (!metro) notFound();
  return (
    <>
      <Hero tag={metro.state} headline={`${metro.name} metro dashboard`} subheadline="Population, income, and housing indicators from Census ACS." />
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ['Population', formatMetric(metro.population, 'persons')],
          ['Median household income', formatMetric(metro.medianHouseholdIncome, 'USD')],
          ['Median home value', formatMetric(metro.medianHomeValue, 'USD')],
        ].map(([label, value]) => (
          <div key={label} className="card p-6">
            <div className="section-label">{label}</div>
            <div className="mt-2 text-3xl font-bold text-text-primary">{value}</div>
            <p className="mt-3 text-xs text-text-muted">{metro.source}</p>
          </div>
        ))}
      </section>
    </>
  );
}
