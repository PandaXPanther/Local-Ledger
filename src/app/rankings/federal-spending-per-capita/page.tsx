import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getFederalSpending, formatMetric, topBy } from '@/lib/nationalData';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Federal Spending Per Capita',
  description: 'Compare federal spending per capita by state using USAspending.gov award data normalized by population.',
  path: '/rankings/federal-spending-per-capita/',
});

export default function Page() {
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rankings', path: '/rankings/' },
    { name: 'Federal Spending Per Capita', path: '/rankings/federal-spending-per-capita/' },
  ]);
  const rows = topBy(getFederalSpending(), item => item.perCapita, 25).map((item, index) => ({
    rank: index + 1,
    name: item.state,
    href: `/states/${item.stateSlug}/federal-spending/`,
    value: formatMetric(item.perCapita, 'USD per person'),
    detail: `FY${item.fiscalYear} total ${formatMetric(item.total, 'USD')}`,
  }));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} /><Hero tag="Rankings" headline="Federal spending per capita" subheadline="USAspending.gov federal award flows normalized by state population." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
