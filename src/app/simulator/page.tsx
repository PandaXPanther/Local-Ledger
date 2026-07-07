import type { Metadata } from 'next';
import Link from 'next/link';
import { SimulatorClient } from '@/components/simulator/SimulatorClient';
import { PARAM_GROUPS, PARAM_DEFS, defsForGroup } from '@/lib/sim/params';
import { PRESETS } from '@/lib/sim/presets';
import { breadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Economy Simulator: Run a Nation, Crash It, Fix It',
  description:
    'A free interactive macroeconomics simulator with 41 tunable policy dials: interest rates, taxes, tariffs, money printing, the gold standard, bank bailouts, and more. Load Weimar hyperinflation, 1929, stagflation, or 2008 and see what each policy actually does.',
  keywords: [
    'economy simulator', 'economic policy simulator', 'macroeconomics simulator', 'inflation simulator',
    'central bank simulator', 'gold standard simulation', 'hyperinflation simulation', 'stock market crash simulation',
    'interactive economics', 'economics education tool', 'AP economics', 'monetary policy game',
  ],
  alternates: { canonical: '/simulator/' },
  openGraph: {
    title: 'The Machine: a ten-million-citizen economy you are allowed to destroy',
    description:
      '41 policy dials, 12 historical scenarios, zero safety interlocks. A free educational macroeconomics simulator by LocalLedger.',
    url: `${SITE_URL}/simulator/`,
  },
};

const MECHANISMS = [
  {
    name: 'The Taylor rule',
    body: 'In automatic mode the central bank sets interest rates the way modern central banks describe their own behavior: a neutral rate, plus inflation, plus an extra push for every point inflation misses the target, plus a response to the output gap. Turn the aggressiveness dial below 1 and the rule stops keeping up with inflation, which is roughly the mistake of the 1970s.',
  },
  {
    name: "Okun's law",
    body: 'Unemployment in the Machine falls when output grows faster than potential and rises when it grows slower, at about half a point of unemployment per two points of growth gap. It is the hinge that turns a financial crisis into layoffs.',
  },
  {
    name: 'The Phillips curve and expectations',
    body: 'Inflation is built from expectations, the output gap, money growth beyond what the economy can absorb, and cost shocks from oil, tariffs, and a weak currency. Expectations adapt slowly while inflation is polite, and unanchor once it passes roughly 20 percent. That unanchoring is the cliff edge in the hyperinflation scenario.',
  },
  {
    name: 'The quantity theory, eventually',
    body: 'Printing money does nothing dramatic in small doses because the model, like the real economy, has slack. Print faster than output can grow for long enough and the extra money passes through to prices, first at about a third, then almost one for one once expectations break.',
  },
  {
    name: 'Balance-sheet banking',
    body: 'Banks hold a capital cushion against loan losses. Unemployment, falling house prices, and leveraged stock crashes eat that cushion; if it drops below survival level, the bank fails. Bailouts restore the cushion at taxpayer expense and raise the moral hazard meter, which quietly increases risk appetite in the next cycle. Refusing bailouts protects the meter and shreds credit instead.',
  },
  {
    name: 'Bubble mechanics',
    body: 'Stocks have a fair value tied to earnings and discount rates, and a bubble term fed by speculation, leverage, cheap credit, and recent gains. The pull toward fair value is weak, which is the honest part: bubbles can outrun fundamentals for years. Crash probability rises with the square of overvaluation.',
  },
  {
    name: 'The gold standard',
    body: 'On gold, the money supply is pinned to reserves, the exchange rate is fixed, and the policy rate defends the peg instead of the economy. A growing economy chained to fixed money gets deflation; a government in debt gets a sovereign crisis it cannot print away. Both are on the scenario shelf.',
  },
  {
    name: 'The social ledger',
    body: 'Discrimination excludes workers, opening a persistent unemployment gap and lowering total output for everyone, not just the excluded group. Education feeds mobility and long-run growth. Rents outrunning wages feed homelessness, buffered by the safety net. Happiness aggregates jobs, stable prices, real income growth, fairness, housing, health coverage, and not currently living through a crisis.',
  },
];

export default function SimulatorPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Economy Simulator', path: '/simulator/' },
  ]);

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'LearningResource'],
    name: 'The LocalLedger Economy Machine',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    url: `${SITE_URL}/simulator/`,
    description:
      'An interactive macroeconomic simulation of a synthetic ten-million-citizen nation with 41 tunable policy parameters and 12 historical preset scenarios, built for economics education.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
    educationalLevel: 'High school and undergraduate economics',
    learningResourceType: 'Interactive simulation',
    teaches: [
      'Monetary policy and the Taylor rule',
      'Fiscal policy, deficits, and sovereign debt crises',
      'Inflation, hyperinflation, and expectations',
      'The gold standard versus fiat currency',
      'Banking crises, bailouts, and moral hazard',
      'Asset bubbles and stock market crashes',
      'Tariffs, trade wars, and exchange rates',
      'Housing markets, affordability, and homelessness',
      'Inequality, discrimination, and social mobility',
    ],
    creator: { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: 'LocalLedger' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      {/* Machine room header */}
      <section className="ledger-ruling-dark border-b border-machine-line bg-machine text-cream">
        <div className="mx-auto max-w-[1500px] px-4 pb-8 pt-10 sm:px-6">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-bright">
            The Machine / simulation deck
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.02] sm:text-5xl">
            A ten-million-citizen economy you are allowed to destroy.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/70">
            Every number on the rest of this site is real and cited. Nothing on this page is. The
            Machine is a simplified model nation: 41 policy dials, 12 historical scenarios, and no
            safety interlocks. Print money, raise tariffs, abolish deposit insurance, go back on
            gold. It is the one room in the building where being wrong is free.
          </p>
        </div>
      </section>

      <SimulatorClient />

      {/* Education deck: server-rendered for readers and search engines */}
      <section className="border-t border-rule bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="section-label">Under the hood</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">How the Machine works</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-text-secondary">
            The Machine advances one quarter at a time. Each quarter it recomputes output, prices,
            jobs, credit, markets, trade, and the social ledger using simplified versions of the
            relationships taught in macroeconomics courses. It is deterministic: the same dials and
            the same starting point always produce the same history, so experiments are repeatable.
            It is a teaching instrument, not a forecast.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MECHANISMS.map(mechanism => (
              <div key={mechanism.name} className="card p-5">
                <h3 className="font-display text-lg font-bold text-ink">{mechanism.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{mechanism.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-canvas">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="section-label">Scenario shelf</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">Twelve scenarios from the history of getting it wrong</h2>
          <div className="mt-8 space-y-5">
            {PRESETS.map((preset, index) => (
              <article key={preset.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-ink">
                    <span className="mr-2 font-mono text-xs font-bold text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {preset.name}
                  </h3>
                  <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-muted">
                    {preset.era}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{preset.description}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  <span className="font-semibold text-ink">Watch for: </span>
                  {preset.watchFor}
                </p>
                <Link
                  href={`/simulator/?scenario=${preset.id}`}
                  className="editorial-link mt-3 inline-block text-sm font-semibold text-accent-dark"
                >
                  Load this scenario
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="section-label">Reference</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">Every dial, documented</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-text-secondary">
            All {PARAM_DEFS.length} controls in the Machine, grouped the way they appear on the
            control rail. Each note explains the mechanism the dial drives inside the model.
          </p>
          <div className="mt-8 space-y-8">
            {PARAM_GROUPS.map(group => (
              <div key={group.key}>
                <h3 className="font-display text-xl font-bold text-ink">{group.label}</h3>
                <p className="mt-1 text-sm text-text-secondary">{group.blurb}</p>
                <dl className="mt-3 divide-y divide-border rounded-[10px] border border-border bg-surface">
                  {defsForGroup(group.key).map(def => (
                    <div key={def.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
                      <dt className="text-sm font-semibold text-ink">{def.label}</dt>
                      <dd className="text-sm leading-relaxed text-text-secondary">{def.note}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="card mt-10 p-5">
            <p className="text-sm leading-relaxed text-text-secondary">
              <span className="font-semibold text-ink">Honesty note: </span>
              the Machine is the only page on LocalLedger that shows numbers which are not real.
              Everything it produces is generated by a documented, simplified model so that policy
              cause and effect can be experienced instead of memorized. For the real economy, with
              sources on every figure, start with the{' '}
              <Link href="/states/" className="editorial-link font-semibold text-accent-dark">
                state dashboards
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
