import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { getStates, formatMetric, topBy } from '@/lib/nationalData';

export const metadata: Metadata = {
  title: 'State Economic Dashboards',
  description: 'Compare U.S. state economic dashboards with official data on jobs, income, housing, GDP, college ROI, and federal spending.',
  alternates: { canonical: '/states/' },
  openGraph: {
    title: 'State Economic Dashboards | LocalLedger',
    description: 'Compare official public economic data across every U.S. state.',
    url: '/states/',
  },
};

export default function StatesPage() {
  const states = getStates();
  const leaders = topBy(states, state => state.localEconomyScore.value, 5);

  return (
    <>
      <Hero
        tag="Explore"
        headline="State economic intelligence, now national."
        subheadline="Every state dashboard uses official source metadata, build-time validation, and raw response caching."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          {leaders.map(state => (
            <Link key={state.slug} href={`/states/${state.slug}/`} className="card p-4 transition-shadow hover:shadow-md">
              <div className="text-xs font-semibold uppercase text-text-muted">{state.abbreviation}</div>
              <div className="mt-1 font-semibold text-text-primary">{state.name}</div>
              <div className="mt-2 text-2xl font-bold text-brand-blue">{formatMetric(state.localEconomyScore.value, 'score')}</div>
            </Link>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Population</th>
                <th className="px-4 py-3">Median income</th>
                <th className="px-4 py-3">Unemployment</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {states.map(state => (
                <tr key={state.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium"><Link href={`/states/${state.slug}/`} className="text-brand-blue hover:underline">{state.name}</Link></td>
                  <td className="px-4 py-3">{formatMetric(state.population.value, 'persons')}</td>
                  <td className="px-4 py-3">{formatMetric(state.medianHouseholdIncome.value, 'USD')}</td>
                  <td className="px-4 py-3">{formatMetric(state.unemploymentRate.value, 'percent')}</td>
                  <td className="px-4 py-3">{formatMetric(state.localEconomyScore.value, 'score')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
