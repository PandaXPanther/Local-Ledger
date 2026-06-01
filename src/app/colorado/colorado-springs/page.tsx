import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { CityDashboard } from '@/components/CityDashboard';
import { loadCitySnapshot } from '@/lib/loadCityData';

export const metadata: Metadata = {
  title: 'Colorado Springs Economic Dashboard',
  description: 'Official economic data for Colorado Springs, CO - unemployment, income, housing, and local economy score.',
};

export default function ColoradoSpringsPage() {
  const snapshot = loadCitySnapshot('colorado-springs');

  return (
    <>
      <Hero
        tag="Colorado Springs · Colorado"
        headline="Colorado Springs Economic Dashboard"
        subheadline="Official labor, income, and housing data for the Colorado Springs metropolitan area from FRED and Census Bureau."
      />
      {snapshot ? (
        <CityDashboard snapshot={snapshot} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-text-muted">
          Data not yet fetched. Run <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">pnpm data:fetch</code> first.
        </div>
      )}
    </>
  );
}
