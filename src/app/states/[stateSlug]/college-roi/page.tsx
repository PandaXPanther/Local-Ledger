import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { getStateBundle, getStates, formatMetric } from '@/lib/nationalData';
import { breadcrumbJsonLd } from '@/lib/seo';

interface Props { params: { stateSlug: string } }

export function generateStaticParams() {
  return getStates().map(state => ({ stateSlug: state.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) return {};
  return {
    title: `${bundle.state.name} College ROI`,
    description: `Compare ${bundle.state.name} college ROI indicators including net price, completion, earnings, debt, and value score.`,
    alternates: { canonical: `/states/${bundle.state.slug}/college-roi/` },
  };
}

export default function StateCollegeRoiPage({ params }: Props) {
  const bundle = getStateBundle(params.stateSlug);
  if (!bundle.state) notFound();
  const colleges = [...bundle.colleges].sort((a, b) => (b.valueScore ?? -1) - (a.valueScore ?? -1)).slice(0, 100);
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'States', path: '/states/' },
    { name: bundle.state.name, path: `/states/${bundle.state.slug}/` },
    { name: 'College ROI', path: `/states/${bundle.state.slug}/college-roi/` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <Hero tag="College ROI" headline={`${bundle.state.name} college ROI`} subheadline="College Scorecard net price, completion, earnings, and debt indicators." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="table-shell overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr><th className="px-4 py-3">College</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Net price</th><th className="px-4 py-3">Earnings</th><th className="px-4 py-3">Value score</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {colleges.map(college => (
                <tr key={college.unitId} className="table-row">
                  <td className="px-4 py-3 font-medium">{college.name}</td>
                  <td className="px-4 py-3">{college.city}</td>
                  <td className="px-4 py-3 font-mono">{formatMetric(college.netPrice, 'USD')}</td>
                  <td className="px-4 py-3 font-mono">{formatMetric(college.medianEarnings, 'USD')}</td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">{formatMetric(college.valueScore, 'score')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
