import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { MetricGrid } from '@/components/MetricGrid';
import { getState, getStateBundle, getStates, formatMetric, topBy } from '@/lib/nationalData';

interface Props {
  params: { stateSlug: string };
}

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const state = getState(params.stateSlug);
  if (!state) return {};
  return {
    title: `${state.name} Economic Dashboard`,
    description: `Official economic dashboard for ${state.name}: population, income, unemployment, GDP, counties, colleges, and federal spending.`,
    alternates: { canonical: `/states/${state.slug}/` },
    openGraph: {
      title: `${state.name} Economic Dashboard | LocalLedger`,
      description: `Official public economic data for ${state.name}.`,
      url: `/states/${state.slug}/`,
    },
  };
}

export default function StatePage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const state = bundle.state;
  const counties = topBy(bundle.counties, county => county.localEconomyScore, 8);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${state.name} Economic Dashboard`,
    url: `https://localledger.pages.dev/states/${state.slug}/`,
    creator: { '@type': 'Organization', name: 'LocalLedger' },
    temporalCoverage: state.population.date,
    variableMeasured: ['population', 'median household income', 'unemployment rate', 'GDP', 'federal spending per capita'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero
        tag={state.abbreviation}
        headline={`${state.name} economic dashboard`}
        subheadline="Official public data with source metadata, raw response caching, and validation on every build."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MetricGrid
          metrics={[
            { label: 'Population', metric: state.population },
            { label: 'Median household income', metric: state.medianHouseholdIncome },
            { label: 'Unemployment rate', metric: state.unemploymentRate },
            { label: 'Local Economy Score', metric: state.localEconomyScore },
          ]}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['Counties', `/states/${state.slug}/counties/`],
            ['Cities', `/states/${state.slug}/cities/`],
            ['College ROI', `/states/${state.slug}/college-roi/`],
            ['Federal Spending', `/states/${state.slug}/federal-spending/`],
            ['Recession Radar', `/states/${state.slug}/recession-radar/`],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="card p-5 font-semibold text-text-primary transition-shadow hover:shadow-md">
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-text-primary">Top counties</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {counties.map(county => (
              <Link key={county.fips} href={`/counties/${county.stateSlug}/${county.slug}/`} className="card flex items-center justify-between p-4 hover:shadow-md">
                <span className="font-medium">{county.county}</span>
                <span className="text-sm text-text-secondary">{formatMetric(county.localEconomyScore, 'score')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
