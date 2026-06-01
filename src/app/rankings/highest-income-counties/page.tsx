import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getCounties, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = { title: 'Highest Income Counties', description: 'Highest median household income counties from Census ACS.', alternates: { canonical: '/rankings/highest-income-counties/' } };

export default function Page() {
  const rows = topBy(getCounties(), county => county.medianHouseholdIncome, 25).map((county, index) => ({
    rank: index + 1,
    name: `${county.county}, ${county.stateAbbreviation}`,
    href: `/counties/${county.stateSlug}/${county.slug}/`,
    value: formatMetric(county.medianHouseholdIncome, 'USD'),
    detail: `Population ${formatMetric(county.population, 'persons')}`,
  }));
  return <><Hero tag="Rankings" headline="Highest income counties" subheadline="County median household income from Census ACS." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
