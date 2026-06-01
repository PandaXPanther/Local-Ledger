import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getFederalSpending, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = { title: 'Federal Spending Per Capita', description: 'Federal award spending per capita by state from USAspending.gov.', alternates: { canonical: '/rankings/federal-spending-per-capita/' } };

export default function Page() {
  const rows = topBy(getFederalSpending(), item => item.perCapita, 25).map((item, index) => ({
    rank: index + 1,
    name: item.state,
    href: `/states/${item.stateSlug}/federal-spending/`,
    value: formatMetric(item.perCapita, 'USD per person'),
    detail: `FY${item.fiscalYear} total ${formatMetric(item.total, 'USD')}`,
  }));
  return <><Hero tag="Rankings" headline="Federal spending per capita" subheadline="USAspending.gov federal award flows normalized by state population." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
