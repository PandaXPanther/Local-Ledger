import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { RiskBadge } from '@/components/RiskBadge';
import { getStateBundle, getStates, formatMetric } from '@/lib/nationalData';

interface Props { params: { stateSlug: string } }

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return { title: `${bundle.state.name} Recession Radar`, description: `Educational slowdown risk indicator for ${bundle.state.name}.`, alternates: { canonical: `/states/${bundle.state.slug}/recession-radar/` } };
}

export default function StateRecessionRadarPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const risk = bundle.recessionRadar;
  const level = risk.overall === 'elevated' || risk.overall === 'moderate' || risk.overall === 'low' ? risk.overall : 'moderate';
  return (
    <>
      <Hero tag="Recession Radar" headline={`${bundle.state.name} slowdown risk`} subheadline="Educational risk signal using official labor-market data. Not financial advice." />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card p-8">
          <RiskBadge level={level} />
          <p className="mt-4 text-5xl font-bold text-text-primary">{formatMetric(risk.score, 'score')}</p>
          <p className="mt-4 text-text-secondary">{risk.methodologyNote}</p>
          <p className="mt-3 text-sm text-text-muted">Sources: {risk.sources.join(', ') || 'Data unavailable'}</p>
        </div>
      </section>
    </>
  );
}
