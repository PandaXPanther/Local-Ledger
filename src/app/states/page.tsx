import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';

export const metadata: Metadata = {
  title: 'State Economic Dashboards',
  description:
    'Template-ready state economic dashboard architecture for LocalLedger, starting with Colorado.',
};

const STATE_FOUNDATIONS = [
  {
    name: 'Colorado',
    status: 'Live MVP',
    href: '/colorado/',
    coverage: 'State overview, 5 cities, counties, college ROI, federal spending, recession radar',
  },
  {
    name: 'National expansion',
    status: 'Template-ready',
    href: '/methodology/',
    coverage: 'Shared schemas for official source metadata, validation, score formulas, and static JSON output',
  },
];

export default function StatesPage() {
  return (
    <>
      <Hero
        tag="National foundation"
        headline="State economic intelligence, built to scale."
        subheadline="LocalLedger starts with Colorado and uses a reusable data architecture for future state dashboards."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {STATE_FOUNDATIONS.map(item => (
            <Link key={item.name} href={item.href} className="card p-6 transition-shadow hover:shadow-md">
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue">
                {item.status}
              </div>
              <h2 className="text-2xl font-bold text-text-primary">{item.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.coverage}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
