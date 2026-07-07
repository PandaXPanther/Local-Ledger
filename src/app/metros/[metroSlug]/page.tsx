import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getMetro, getMetros, formatMetric } from '@/lib/nationalData';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';

interface Props { params: { metroSlug: string } }

export function generateStaticParams() {
  return getMetros().map(metro => ({ metroSlug: metro.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const metro = getMetro(params.metroSlug);
  if (!metro) return {};
  return pageMeta({
    title: `${metro.name} Metro Dashboard`,
    description: `${metro.name}, ${metro.state} metro economic indicators for population, median income, and home value from Census ACS.`,
    path: `/metros/${metro.slug}/`,
  });
}

export default function MetroPage({ params }: Props) {
  const metro = getMetro(params.metroSlug);
  if (!metro) notFound();
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Metros', path: '/metros/' },
    { name: metro.name, path: `/metros/${metro.slug}/` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
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
