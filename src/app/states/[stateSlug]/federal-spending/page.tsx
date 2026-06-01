import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { MetricGrid } from '@/components/MetricGrid';
import { getStateBundle, getStates, formatMetric } from '@/lib/nationalData';

interface Props { params: { stateSlug: string } }

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return { title: `${bundle.state.name} Federal Spending`, description: `USAspending federal award flows for ${bundle.state.name}.`, alternates: { canonical: `/states/${bundle.state.slug}/federal-spending/` } };
}

export default function StateFederalSpendingPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const spending = bundle.federalSpending[0];
  return (
    <>
      <Hero tag="USAspending" headline={`${bundle.state.name} federal spending`} subheadline="Federal award spending summarized from USAspending.gov." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MetricGrid metrics={[{ label: 'Federal spending per capita', metric: bundle.state.federalSpendingPerCapita }]} />
        <div className="card mt-8 p-6">
          <h2 className="text-xl font-bold text-text-primary">FY{spending?.fiscalYear ?? 2024} state total</h2>
          <p className="mt-2 text-4xl font-bold text-brand-blue">{formatMetric(spending?.total, 'USD')}</p>
          <p className="mt-3 text-sm text-text-secondary">Source: USAspending.gov API v2 spending_by_geography.</p>
        </div>
      </section>
    </>
  );
}
