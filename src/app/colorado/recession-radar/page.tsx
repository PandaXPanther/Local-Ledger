import type { Metadata } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Hero } from '@/components/Hero';
import { MethodologyCallout } from '@/components/MethodologyCallout';
import { SourceBadge } from '@/components/SourceBadge';
import { LastUpdated } from '@/components/LastUpdated';
import { RiskBadge } from '@/components/RiskBadge';
import { ScoreGauge } from '@/components/ScoreGauge';
import type { RiskLevel } from '@/types/data';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Colorado Recession Radar - Slowdown Risk Indicator',
  description: 'Educational slowdown risk indicator for Colorado based on public economic data. Not financial advice.',
  path: '/colorado/recession-radar/',
});

interface RecessionData {
  _meta: {
    description: string;
    generatedAt: string;
    disclaimer: string;
  };
  overall: RiskLevel;
  score: number;
  components: {
    unemploymentTrend: string;
    housingActivity: string;
    laborMarket: string;
  };
  lastUpdated: string;
  methodologyNote: string;
  sources: Array<{ name: string; url: string; dataset: string }>;
  dataQualityNote?: string;
}

function loadRecessionData(): RecessionData | null {
  const p = join(process.cwd(), 'public', 'data', 'processed', 'recession-indicator.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

const COMPONENT_LABELS: Record<string, string> = {
  unemploymentTrend: 'Unemployment Trend',
  housingActivity: 'Housing Activity',
  laborMarket: 'Labor Market',
};

const TREND_COLORS: Record<string, string> = {
  rising: 'text-danger',
  weakening: 'text-danger',
  contracting: 'text-danger',
  stable: 'text-warning',
  neutral: 'text-text-secondary',
  falling: 'text-success',
  expanding: 'text-success',
  strengthening: 'text-success',
};

export default function RecessionRadarPage() {
  const data = loadRecessionData();
  const generatedAt = data?._meta?.generatedAt ?? null;
  const disclaimer = data?._meta?.disclaimer ?? 'This indicator is an educational model based on public historical data. It is not financial advice, investment advice, or a guaranteed forecast.';

  return (
    <>
      <Hero
        tag="Colorado · Recession Radar"
        headline="Slowdown Risk Indicator"
        subheadline="An educational model based on public historical data. Not financial advice or a guaranteed forecast."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Required disclaimer */}
        <div className="mb-6">
          <MethodologyCallout
            type="warning"
            title="Important disclaimer"
            note={disclaimer}
          />
        </div>

        {generatedAt && (
          <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
            <LastUpdated timestamp={generatedAt} label="Indicator computed" />
          </div>
        )}

        {data ? (
          <>
            {/* Risk summary */}
            <section aria-label="Slowdown risk summary" className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gauge */}
                <div className="card p-8 flex flex-col items-center justify-center gap-6">
                  <ScoreGauge
                    score={data.score}
                    label="Slowdown Risk Score"
                    size="lg"
                    methodologyNote="0 = no risk signals; 100 = all tracked indicators elevated. Computed from public FRED data."
                  />
                  <RiskBadge level={data.overall} size="lg" />
                  <p className="text-xs text-text-muted text-center max-w-xs">
                    Colorado Slowdown Risk Indicator - educational model only
                  </p>
                </div>

                {/* Component breakdown */}
                <div className="card p-6">
                  <h2 className="font-semibold text-text-primary mb-4">Component Signals</h2>
                  <div className="space-y-4">
                    {Object.entries(data.components).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-text-primary text-sm">
                            {COMPONENT_LABELS[key] ?? key}
                          </p>
                          <p className="text-xs text-text-muted">From FRED public data</p>
                        </div>
                        <span className={`text-sm font-semibold capitalize ${TREND_COLORS[value] ?? 'text-text-secondary'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {data.dataQualityNote && (
                    <p className="text-xs text-text-muted mt-4 p-2 bg-canvas rounded">{data.dataQualityNote}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Methodology */}
            <section aria-label="Methodology" className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">How the Score is Computed</h2>
              <MethodologyCallout
                type="info"
                title="Methodology note"
                note={data.methodologyNote}
              />
            </section>

            {/* Risk levels */}
            <section aria-label="Risk level definitions" className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">Risk Level Definitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    level: 'low' as RiskLevel,
                    range: 'Score 0-33',
                    desc: 'Available economic indicators are within normal ranges. No significant slowdown signals detected in current data.',
                  },
                  {
                    level: 'moderate' as RiskLevel,
                    range: 'Score 34-66',
                    desc: 'Some economic signals warrant attention. Monitor trends in unemployment, housing, and labor force participation.',
                  },
                  {
                    level: 'elevated' as RiskLevel,
                    range: 'Score 67-100',
                    desc: 'Multiple indicators suggest economic stress. This does not predict a recession - consult professional analysis.',
                  },
                ].map(r => (
                  <div key={r.level} className="card p-4">
                    <div className="mb-2">
                      <RiskBadge level={r.level} />
                      <span className="ml-2 text-xs text-text-muted">{r.range}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Sources */}
            <div className="source-strip flex-wrap gap-3">
              {data.sources.map(s => (
                <SourceBadge key={s.url} name={s.name} url={s.url} dataset={s.dataset} />
              ))}
              {generatedAt && <LastUpdated timestamp={generatedAt} />}
            </div>
          </>
        ) : (
          <div className="card p-8 text-center text-text-muted">
            Data not yet fetched. Run <code className="text-xs bg-canvas px-1 py-0.5 rounded">pnpm data:fetch</code> first.
          </div>
        )}
      </div>
    </>
  );
}
