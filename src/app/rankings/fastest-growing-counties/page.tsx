import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getCounties, formatMetric, topBy } from '@/lib/nationalData';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Fastest Growing Counties',
  description: 'Rank large U.S. counties by official Census population as a conservative growth proxy while historical growth is added.',
  alternates: { canonical: '/rankings/fastest-growing-counties/' },
};

export default function Page() {
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rankings', path: '/rankings/' },
    { name: 'Fastest Growing Counties', path: '/rankings/fastest-growing-counties/' },
  ]);
  const rows = topBy(getCounties(), county => county.population, 25).map((county, index) => ({
    rank: index + 1,
    name: `${county.county}, ${county.stateAbbreviation}`,
    href: `/counties/${county.stateSlug}/${county.slug}/`,
    value: formatMetric(county.population, 'persons'),
    detail: 'Population size proxy. Growth history is queued for the next data pass.',
  }));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} /><Hero tag="Rankings" headline="Fastest growing counties" subheadline="Current build uses official population as a conservative proxy until historical county growth is added." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
