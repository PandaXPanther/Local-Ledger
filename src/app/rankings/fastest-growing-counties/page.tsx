import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getCounties, formatMetric, topBy } from '@/lib/nationalData';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Largest Counties by Population',
  description: 'Rank large U.S. counties by official Census population estimates, with income and housing context for each county.',
  path: '/rankings/fastest-growing-counties/',
});

export default function Page() {
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rankings', path: '/rankings/' },
    { name: 'Largest Counties by Population', path: '/rankings/fastest-growing-counties/' },
  ]);
  const rows = topBy(getCounties(), county => county.population, 25).map((county, index) => ({
    rank: index + 1,
    name: `${county.county}, ${county.stateAbbreviation}`,
    href: `/counties/${county.stateSlug}/${county.slug}/`,
    value: formatMetric(county.population, 'persons'),
    detail: 'Ranked by current ACS population estimate.',
  }));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} /><Hero tag="Rankings" headline="Largest counties by population" subheadline="Official ACS population estimates ranked from largest to smallest." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
