import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Economic Rankings',
  description: 'Rank states and counties by local economy score, income, population, college affordability, and federal spending.',
  path: '/rankings/',
  keywords: ['state economy rankings', 'county income rankings', 'best local economies', 'college affordability rankings'],
});

const RANKINGS = [
  ['Best Local Economies', '/rankings/best-local-economies/', 'State composite scores from income, labor, affordability, population, and fiscal indicators.'],
  ['Largest Counties by Population', '/rankings/fastest-growing-counties/', 'County population estimates from Census ACS.'],
  ['Highest Income Counties', '/rankings/highest-income-counties/', 'County median household income from Census ACS.'],
  ['Most Affordable College States', '/rankings/most-affordable-college-states/', 'State college value from College Scorecard net price and earnings.'],
  ['Federal Spending Per Capita', '/rankings/federal-spending-per-capita/', 'USAspending awards normalized by state population.'],
];

export default function RankingsPage() {
  return (
    <>
      <Hero tag="Rankings" headline="Transparent rankings from official data." subheadline="Every ranking is backed by source metadata, dates, and validation." />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {RANKINGS.map(([name, href, basis]) => (
          <Link key={href} href={href} className="card p-6 transition-shadow hover:shadow-md">
            <h2 className="text-xl font-bold text-text-primary">{name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{basis}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
