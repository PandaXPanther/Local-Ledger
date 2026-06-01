import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getCounties, getCounty, formatMetric, topBy } from '@/lib/nationalData';

interface Props { params: { stateSlug: string; countySlug: string } }

export function generateStaticParams() {
  return topBy(getCounties(), county => county.population, 350).map(county => ({
    stateSlug: county.stateSlug,
    countySlug: county.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const county = getCounty(params.stateSlug, params.countySlug);
  if (!county) return {};
  return {
    title: `${county.county} Economic Dashboard`,
    description: `Official Census ACS indicators for ${county.county}, ${county.state}.`,
    alternates: { canonical: `/counties/${county.stateSlug}/${county.slug}/` },
  };
}

export default function CountyPage({ params }: Props) {
  const county = getCounty(params.stateSlug, params.countySlug);
  if (!county) notFound();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${county.county}, ${county.state} economic indicators`,
    url: `https://localledger.pages.dev/counties/${county.stateSlug}/${county.slug}/`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero tag={county.stateAbbreviation} headline={`${county.county} economic dashboard`} subheadline="County indicators from Census ACS with transparent source metadata." />
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {[
          ['Population', formatMetric(county.population, 'persons')],
          ['Median household income', formatMetric(county.medianHouseholdIncome, 'USD')],
          ['Median home value', formatMetric(county.medianHomeValue, 'USD')],
          ['Local Economy Score', formatMetric(county.localEconomyScore, 'score')],
        ].map(([label, value]) => (
          <div key={label} className="card p-6">
            <div className="section-label">{label}</div>
            <div className="mt-2 text-3xl font-bold text-text-primary">{value}</div>
            <p className="mt-3 text-xs text-text-muted">{county.source}</p>
          </div>
        ))}
      </section>
    </>
  );
}
