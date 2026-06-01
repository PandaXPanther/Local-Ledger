import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getStates, formatMetric, topBy } from '@/lib/nationalData';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Best Local Economies',
  description: 'Rank U.S. states by Local Economy Score using official income, labor, affordability, population, and federal spending data.',
  alternates: { canonical: '/rankings/best-local-economies/' },
};

export default function Page() {
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rankings', path: '/rankings/' },
    { name: 'Best Local Economies', path: '/rankings/best-local-economies/' },
  ]);
  const rows = topBy(getStates(), state => state.localEconomyScore.value, 25).map((state, index) => ({
    rank: index + 1,
    name: state.name,
    href: `/states/${state.slug}/`,
    value: formatMetric(state.localEconomyScore.value, 'score'),
    detail: `${formatMetric(state.medianHouseholdIncome.value, 'USD')} median income`,
  }));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} /><Hero tag="Rankings" headline="Best local economies" subheadline="Composite scores from official state indicators." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
