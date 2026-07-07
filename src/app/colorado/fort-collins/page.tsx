import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { CityDashboard } from '@/components/CityDashboard';
import { loadCitySnapshot } from '@/lib/loadCityData';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Fort Collins Economic Dashboard',
  description: 'Official economic data for Fort Collins, CO - unemployment, income, housing, and local economy score.',
  path: '/colorado/fort-collins/',
});

export default function FortCollinsPage() {
  const snapshot = loadCitySnapshot('fort-collins');

  return (
    <>
      <Hero
        tag="Fort Collins · Colorado"
        headline="Fort Collins Economic Dashboard"
        subheadline="Official labor, income, and housing data for the Fort Collins-Loveland metropolitan area from FRED and Census Bureau."
      />
      {snapshot ? (
        <CityDashboard snapshot={snapshot} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-text-muted">
          Data not yet fetched. Run <code className="text-xs bg-canvas px-1 py-0.5 rounded">pnpm data:fetch</code> first.
        </div>
      )}
    </>
  );
}
