import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getStateBundle, getStates, formatMetric } from '@/lib/nationalData';

interface Props {
  params: { stateSlug: string };
}

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return {
    title: `${bundle.state.name} Counties`,
    description: `County-level Census ACS economic data for ${bundle.state.name}.`,
    alternates: { canonical: `/states/${bundle.state.slug}/counties/` },
  };
}

export default function StateCountiesPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();

  return (
    <>
      <Hero tag={bundle.state.abbreviation} headline={`${bundle.state.name} counties`} subheadline="County population, income, housing, and Local Economy Score from official public data." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-text-secondary">
              <tr><th className="px-4 py-3">County</th><th className="px-4 py-3">Population</th><th className="px-4 py-3">Income</th><th className="px-4 py-3">Home value</th><th className="px-4 py-3">Score</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bundle.counties.map(county => (
                <tr key={county.fips} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium"><Link href={`/counties/${county.stateSlug}/${county.slug}/`} className="text-brand-blue hover:underline">{county.county}</Link></td>
                  <td className="px-4 py-3">{formatMetric(county.population, 'persons')}</td>
                  <td className="px-4 py-3">{formatMetric(county.medianHouseholdIncome, 'USD')}</td>
                  <td className="px-4 py-3">{formatMetric(county.medianHomeValue, 'USD')}</td>
                  <td className="px-4 py-3">{formatMetric(county.localEconomyScore, 'score')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
