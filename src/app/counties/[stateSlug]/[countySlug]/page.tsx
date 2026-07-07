import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getCounties, getCounty, formatMetric } from '@/lib/nationalData';
import { breadcrumbJsonLd, localLedgerDatasetJsonLd, pageMeta } from '@/lib/seo';

interface Props { params: { stateSlug: string; countySlug: string } }

export function generateStaticParams() {
  return getCounties().map(county => ({
    stateSlug: county.stateSlug,
    countySlug: county.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const county = getCounty(params.stateSlug, params.countySlug);
  if (!county) return {};
  return pageMeta({
    title: `${county.county} Economic Dashboard`,
    description: `${county.county}, ${county.state} economic indicators for population, median income, home value, and Local Economy Score.`,
    path: `/counties/${county.stateSlug}/${county.slug}/`,
  });
}

export default function CountyPage({ params }: Props) {
  const county = getCounty(params.stateSlug, params.countySlug);
  if (!county) notFound();
  const datasetJsonLd = localLedgerDatasetJsonLd({
    name: `${county.county}, ${county.state} economic indicators`,
    description: `County economic indicators for ${county.county}, ${county.state} from official Census ACS data.`,
    url: `/counties/${county.stateSlug}/${county.slug}/`,
    variableMeasured: ['population', 'median household income', 'median home value', 'Local Economy Score'],
    distribution: [
      {
        name: 'County economic indicators',
        contentUrl: '/data/processed/counties.json',
        description: 'County ACS data by state.',
      },
    ],
  });
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Counties', path: '/counties/' },
    { name: county.state, path: `/states/${county.stateSlug}/` },
    { name: county.county, path: `/counties/${county.stateSlug}/${county.slug}/` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
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
            <div className="mt-2 font-mono text-3xl font-bold text-ink">{value}</div>
            <p className="mt-3 text-xs text-text-muted">{county.source}</p>
          </div>
        ))}
      </section>
    </>
  );
}
