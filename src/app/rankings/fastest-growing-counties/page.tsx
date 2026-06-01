import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getCounties, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = { title: 'Fastest Growing Counties', description: 'Large county growth proxy ranking from Census ACS population until multi-year growth is added.', alternates: { canonical: '/rankings/fastest-growing-counties/' } };

export default function Page() {
  const rows = topBy(getCounties(), county => county.population, 25).map((county, index) => ({
    rank: index + 1,
    name: `${county.county}, ${county.stateAbbreviation}`,
    href: `/counties/${county.stateSlug}/${county.slug}/`,
    value: formatMetric(county.population, 'persons'),
    detail: 'Population size proxy. Growth history is queued for the next data pass.',
  }));
  return <><Hero tag="Rankings" headline="Fastest growing counties" subheadline="Current build uses official population as a conservative proxy until historical county growth is added." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
