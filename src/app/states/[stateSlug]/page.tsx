import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { MetricGrid } from '@/components/MetricGrid';
import { getState, getStateBundle, getStates, formatMetric, topBy } from '@/lib/nationalData';
import { breadcrumbJsonLd, localLedgerDatasetJsonLd } from '@/lib/seo';

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
    description: `${state.name} economic data for unemployment, income, population, GDP, counties, college ROI, and federal spending from official sources.`,
    alternates: { canonical: `/states/${state.slug}/` },
    openGraph: {
      title: `${state.name} Economic Dashboard | LocalLedger`,
      description: `${state.name} economic data for jobs, income, GDP, counties, colleges, and federal spending.`,
      url: `/states/${state.slug}/`,
    },
  };
}

export default function StatePage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const state = bundle.state;
  const counties = topBy(bundle.counties, county => county.localEconomyScore, 8);

  const datasetJsonLd = localLedgerDatasetJsonLd({
    name: `${state.name} Economic Dashboard`,
    description: `Official public economic data for ${state.name}, including labor, income, GDP, counties, colleges, and federal spending.`,
    url: `/states/${state.slug}/`,
    temporalCoverage: state.population.date,
    variableMeasured: ['population', 'median household income', 'unemployment rate', 'GDP', 'federal spending per capita'],
    distribution: [
      {
        name: `${state.name} state bundle`,
        contentUrl: `/data/processed/states/${state.slug}.json`,
        description: `${state.name} counties, colleges, federal spending, and recession radar data.`,
      },
      {
        name: 'State dashboard index',
        contentUrl: '/data/processed/states.json',
        description: 'All U.S. state dashboard records.',
      },
    ],
  });
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'States', path: '/states/' },
    { name: state.name, path: `/states/${state.slug}/` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <Hero
        tag={state.abbreviation}
        headline={`${state.name} economic dashboard`}
        subheadline="Official public data with source metadata, raw response caching, and validation on every build."
        pulseTitle={`${state.name} pulse`}
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
            <Link key={href} href={href} className="card group p-5 font-semibold text-text-primary">
              {label}
              <span className="mt-3 block h-0.5 w-8 bg-accent transition-all group-hover:w-14" />
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <h2 className="mb-4 font-display text-3xl font-bold text-ink">Top counties</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {counties.map(county => (
              <Link key={county.fips} href={`/counties/${county.stateSlug}/${county.slug}/`} className="card flex items-center justify-between p-4">
                <span className="font-medium">{county.county}</span>
                <span className="font-mono text-sm font-bold text-accent">{formatMetric(county.localEconomyScore, 'score')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
