import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getStates, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = { title: 'Best Local Economies', description: 'Top state local economy scores from official public data.', alternates: { canonical: '/rankings/best-local-economies/' } };

export default function Page() {
  const rows = topBy(getStates(), state => state.localEconomyScore.value, 25).map((state, index) => ({
    rank: index + 1,
    name: state.name,
    href: `/states/${state.slug}/`,
    value: formatMetric(state.localEconomyScore.value, 'score'),
    detail: `${formatMetric(state.medianHouseholdIncome.value, 'USD')} median income`,
  }));
  return <><Hero tag="Rankings" headline="Best local economies" subheadline="Composite scores from official state indicators." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
