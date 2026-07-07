import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getStateBundle, getStates, formatMetric } from '@/lib/nationalData';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';

interface Props {
  params: { stateSlug: string };
}

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return pageMeta({
    title: `${bundle.state.name} Counties`,
    description: `Compare ${bundle.state.name} county economic indicators for population, income, home value, and Local Economy Score.`,
    path: `/states/${bundle.state.slug}/counties/`,
  });
}

export default function StateCountiesPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'States', path: '/states/' },
    { name: bundle.state.name, path: `/states/${bundle.state.slug}/` },
    { name: 'Counties', path: `/states/${bundle.state.slug}/counties/` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <Hero tag={bundle.state.abbreviation} headline={`${bundle.state.name} counties`} subheadline="County population, income, housing, and Local Economy Score from official public data." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="table-shell overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr><th className="px-4 py-3">County</th><th className="px-4 py-3">Population</th><th className="px-4 py-3">Income</th><th className="px-4 py-3">Home value</th><th className="px-4 py-3">Score</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bundle.counties.map(county => (
                <tr key={county.fips} className="table-row">
                  <td className="px-4 py-3 font-medium"><Link href={`/counties/${county.stateSlug}/${county.slug}/`} className="editorial-link text-accent">{county.county}</Link></td>
                  <td className="px-4 py-3 font-mono">{formatMetric(county.population, 'persons')}</td>
                  <td className="px-4 py-3 font-mono">{formatMetric(county.medianHouseholdIncome, 'USD')}</td>
                  <td className="px-4 py-3 font-mono">{formatMetric(county.medianHomeValue, 'USD')}</td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">{formatMetric(county.localEconomyScore, 'score')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
