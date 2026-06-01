import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { RankingTable } from '@/components/RankingTable';
import { getColleges, formatMetric } from '@/lib/nationalData';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Most Affordable College States',
  description: 'Compare college affordability by state using U.S. College Scorecard net price and institution data.',
  alternates: { canonical: '/rankings/most-affordable-college-states/' },
};

export default function Page() {
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rankings', path: '/rankings/' },
    { name: 'Most Affordable College States', path: '/rankings/most-affordable-college-states/' },
  ]);
  const groups = new Map<string, { slug: string; total: number; count: number }>();
  for (const college of getColleges()) {
    if (college.netPrice === null) continue;
    const current = groups.get(college.state) ?? { slug: college.stateSlug, total: 0, count: 0 };
    current.total += college.netPrice;
    current.count += 1;
    groups.set(college.state, current);
  }
  const rows = [...groups.entries()]
    .map(([state, value]) => ({ state, slug: value.slug, average: value.total / value.count, count: value.count }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 25)
    .map((row, index) => ({ rank: index + 1, name: row.state, href: `/states/${row.slug}/college-roi/`, value: formatMetric(row.average, 'USD'), detail: `${row.count} institutions with net price data` }));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} /><Hero tag="Rankings" headline="Most affordable college states" subheadline="Average reported net price from College Scorecard institutions." /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><RankingTable rows={rows} /></section></>;
}
