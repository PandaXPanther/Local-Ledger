import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';

export const metadata: Metadata = {
  title: 'Economic Rankings',
  description:
    'LocalLedger ranking foundations for cities, counties, college ROI, federal spending, and slowdown risk.',
};

const RANKING_MODULES = [
  { name: 'Colorado counties', href: '/colorado/counties/', basis: 'Population, income, unemployment, housing, spending, and Local Economy Score' },
  { name: 'College ROI', href: '/colorado/college-roi/', basis: 'Net price, graduation, earnings, debt, and transparent Value Score' },
  { name: 'Federal spending', href: '/colorado/federal-spending/', basis: 'Federal grants, contracts, loans, and per-capita award flows' },
  { name: 'Recession radar', href: '/colorado/recession-radar/', basis: 'Educational slowdown risk model using official public indicators' },
];

export default function RankingsPage() {
  return (
    <>
      <Hero
        tag="Rankings"
        headline="Transparent rankings from official data."
        subheadline="Every ranking module exposes its source, timestamp, and methodology note before it asks for trust."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {RANKING_MODULES.map(module => (
            <Link key={module.name} href={module.href} className="card p-6 transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold text-text-primary">{module.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{module.basis}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
