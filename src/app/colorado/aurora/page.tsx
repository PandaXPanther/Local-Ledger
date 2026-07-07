import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { CityDashboard } from '@/components/CityDashboard';
import { loadCitySnapshot } from '@/lib/loadCityData';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Aurora Economic Dashboard',
  description: 'Official economic data for Aurora, CO - unemployment, income, housing, and local economy score.',
  path: '/colorado/aurora/',
});

export default function AuroraPage() {
  const snapshot = loadCitySnapshot('aurora');

  return (
    <>
      <Hero
        tag="Aurora · Colorado"
        headline="Aurora Economic Dashboard"
        subheadline="Official labor, income, and housing data for Aurora, CO from FRED and Census Bureau."
      />
      {snapshot ? (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <MethodologyCallout
              type="info"
              note="Aurora does not have a separate FRED MSA unemployment series. The Denver-Aurora-Lakewood MSA series (DENV708URN) is the closest available proxy and covers the broader metro area. Aurora-specific data is available from Census ACS with API access."
            />
          </div>
          <CityDashboard snapshot={snapshot} />
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-text-muted">
          Data not yet fetched. Run <code className="text-xs bg-canvas px-1 py-0.5 rounded">pnpm data:fetch</code> first.
        </div>
      )}
    </>
  );
}
