import type { Metadata } from 'next';
import Link from 'next/link';
import { SimulatorClient } from '@/components/simulator/SimulatorClient';
import { PARAM_GROUPS, PARAM_DEFS, defsForGroup } from '@/lib/sim/params';
import { PRESETS } from '@/lib/sim/presets';
import { breadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Economy Simulator: Run a Nation, Crash It, Try Again',
  description:
    'A free interactive economics simulator with 41 policy dials: interest rates, taxes, tariffs, money printing, the gold standard, bank bailouts, and more. Load Weimar hyperinflation, 1929, stagflation, or 2008 and see what each policy actually does.',
  keywords: [
    'economy simulator', 'economic policy simulator', 'macroeconomics simulator', 'inflation simulator',
    'central bank simulator', 'gold standard simulation', 'hyperinflation simulation', 'stock market crash simulation',
    'interactive economics', 'economics education tool', 'AP economics', 'monetary policy game',
  ],
  alternates: { canonical: '/simulator/' },
  openGraph: {
    title: 'An economy you are allowed to break',
    description:
      '41 policy dials. 12 historical scenarios. Ten million simulated people. A free economics playground by LocalLedger.',
    url: `${SITE_URL}/simulator/`,
  },
};

const MECHANISMS = [
  {
    name: 'The Taylor rule',
    body: 'In automatic mode, the central bank follows a simple recipe. Start from a neutral rate. Add inflation. Push harder for every point inflation misses the target. Push again when the economy runs hot or cold. Set the aggressiveness dial below 1 and the bank stops keeping up with inflation. That is roughly the mistake of the 1970s.',
  },
  {
    name: "Okun's law",
    body: 'Jobs follow growth. When the economy grows faster than its potential, unemployment falls. When it grows slower, unemployment rises. This is the hinge that turns a financial crisis into layoffs.',
  },
  {
    name: 'The Phillips curve and expectations',
    body: 'Inflation here comes from four places: what people expect, how hot the economy runs, money printed beyond what the economy can absorb, and cost shocks like oil or tariffs. Expectations move slowly while inflation stays polite. Past about 20 percent, they break loose. That break is the cliff edge in the hyperinflation scenario.',
  },
  {
    name: 'The quantity theory, eventually',
    body: 'Printing a little money does nothing dramatic. The economy has slack. But print faster than the economy can grow, for long enough, and prices follow. At first about a third of the extra money shows up in prices. Once expectations break, almost all of it does.',
  },
  {
    name: 'Balance-sheet banking',
    body: 'Banks hold a capital cushion against losses. Unemployment, falling house prices, and leveraged stock crashes eat that cushion. If it runs out, the bank fails. A bailout refills the cushion at taxpayer expense and raises the moral hazard meter, which quietly makes banks bolder in the next cycle. Refuse the bailout and the meter stays clean, but credit gets shredded instead.',
  },
  {
    name: 'Bubble mechanics',
    body: 'Stocks have a fair value tied to earnings and interest rates. On top of that sits a bubble, fed by speculation, borrowed money, cheap credit, and recent gains. The pull back toward fair value is weak, which is the honest part: real bubbles outrun fundamentals for years. The bigger the overvaluation, the more likely the crash.',
  },
  {
    name: 'The gold standard',
    body: 'On gold, the money supply is chained to reserves and the exchange rate is fixed. Interest rates defend the peg, not the economy. A growing economy with fixed money gets deflation. A government deep in debt gets a crisis it cannot print away. Both are on the scenario shelf.',
  },
  {
    name: 'The social ledger',
    body: 'Discrimination locks workers out. That opens a lasting unemployment gap and lowers output for everyone, not just the excluded group. Education feeds mobility and long-run growth. When rents outrun wages, homelessness rises, softened by the safety net. Happiness adds it all up: jobs, stable prices, rising real income, fairness, housing, health coverage, and not currently living through a crisis.',
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
    name: 'LocalLedger Economy Simulator',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    url: `${SITE_URL}/simulator/`,
    description:
      'An interactive simulation of a small nation with ten million simulated people, 41 adjustable policy settings, and 12 historical preset scenarios, built for economics education.',
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

      {/* Simulator header */}
      <section className="relative overflow-hidden border-b border-rule bg-canvas text-text-primary">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(250,250,247,0.92)_0%,rgba(244,241,234,0.84)_48%,rgba(228,238,230,0.88)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-ember to-data" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <span className="mb-5 inline-flex rounded-full border border-accent/20 bg-surface/75 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent shadow-sm">
            Economy Simulator
          </span>
          <h1 className="hero-fade-in max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            An economy you are allowed to break.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Every number on the rest of this site is real and cited. Nothing on this page is. This
            is a simplified model nation with {PARAM_DEFS.length} policy dials and {PRESETS.length}{' '}
            scenarios pulled from history. Print money. Raise tariffs. Go back on gold. Being wrong
            here is free.
          </p>
        </div>
      </section>

      <SimulatorClient />

      {/* How it works: server-rendered for readers and search engines */}
      <section id="how-it-works" className="border-t border-rule bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="section-label">Under the hood</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">How the simulator works</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-text-secondary">
            The simulator moves one quarter at a time. Each quarter it recalculates output, prices,
            jobs, credit, markets, trade, and the social ledger, using simpler versions of the rules
            taught in econ class. Same dials, same starting point, same result, every time. So your
            experiments repeat. It is a teaching tool, not a forecast.
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
                  className="editorial-link mt-3 inline-block text-sm font-semibold text-accent"
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
            All {PARAM_DEFS.length} controls, grouped the way they appear in the control panel. Each
            note explains what the dial actually moves inside the model.
          </p>
          <div className="mt-8 space-y-8">
            {PARAM_GROUPS.map(group => (
              <div key={group.key}>
                <h3 className="font-display text-xl font-bold text-ink">{group.label}</h3>
                <p className="mt-1 text-sm text-text-secondary">{group.blurb}</p>
                <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
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
              <span className="font-semibold text-ink">One honest note: </span>
              this is the only page on LocalLedger where the numbers are not real. Everything here
              comes from a documented, simplified model. The goal is to let you feel how policy
              works instead of memorizing it. For the real economy, with sources on every figure,
              start with the{' '}
              <Link href="/states/" className="editorial-link font-semibold text-accent">
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
