import Link from 'next/link';

export interface HeroSourceCard {
  label: string;
  value: string;
  detail: string;
  status?: 'pass' | 'warn' | 'fail';
}

export interface HeroValidationItem {
  label: string;
  shortLabel?: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tag?: string;
  pulseTitle?: string;
  pulseStatus?: string;
  sourceCards?: HeroSourceCard[];
  validationItems?: HeroValidationItem[];
}

const DEFAULT_SOURCE_CARDS: HeroSourceCard[] = [
  { label: 'FRED', value: 'Live series', detail: 'Labor and GDP', status: 'pass' },
  { label: 'Census', value: 'ACS data', detail: 'Income and housing', status: 'pass' },
  { label: 'BEA', value: 'Regional data', detail: 'State accounts', status: 'pass' },
  { label: 'USAspending', value: 'FY awards', detail: 'Federal flows', status: 'pass' },
];

const DEFAULT_VALIDATION_ITEMS: HeroValidationItem[] = [
  { label: 'Source URLs', status: 'pass', detail: 'Every metric links to its public source.' },
  { label: 'Dataset names', status: 'pass', detail: 'Displayed metrics include dataset labels.' },
  { label: 'Fetch timestamps', status: 'pass', detail: 'Pipeline timestamps are included.' },
  { label: 'Null handling', status: 'pass', detail: 'Unavailable values are explicit.' },
  { label: 'Static export', status: 'pass', detail: 'Data is bundled at build time.' },
  { label: 'Integrity checks', status: 'pass', detail: 'Validation runs before build.' },
];

const STATUS_CLASS = {
  pass: 'border-success/30 bg-[#E2EDE4] text-success',
  warn: 'border-warning/30 bg-ember-soft text-warning',
  fail: 'border-danger/30 bg-[#F3DFDC] text-danger',
};

function statusLabel(status: HeroValidationItem['status']): string {
  if (status === 'pass') return 'Pass';
  if (status === 'warn') return 'Warn';
  return 'Fail';
}

export function Hero({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  tag,
  pulseTitle = 'Data integrity snapshot',
  pulseStatus = 'Official sources',
  sourceCards = DEFAULT_SOURCE_CARDS,
  validationItems = DEFAULT_VALIDATION_ITEMS,
}: HeroProps) {
  return (
    <section className="ledger-ruling relative overflow-hidden border-b border-rule bg-background text-text-primary">
      {/* The spark, deconstructed from the mark, draws itself on load. */}
      <svg
        className="pointer-events-none absolute right-[-40px] top-8 hidden h-64 w-[560px] lg:block"
        viewBox="0 0 560 240"
        aria-hidden="true"
      >
        <path
          d="M20 170 L120 96 L210 196 L340 60 L400 110 L540 24"
          fill="none"
          stroke="#E8540A"
          strokeOpacity="0.16"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="spark-draw"
        />
      </svg>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="hero-fade-in">
          {tag && (
            <span className="mb-5 inline-flex items-center gap-2 border-l-2 border-accent pl-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">
              {tag}
            </span>
          )}
          <h1 className="max-w-4xl font-display text-5xl font-black leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryCta && (
              <Link href={primaryCta.href} className="btn-primary px-7 py-3 text-base">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="btn-secondary px-7 py-3 text-base"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>

        <div className="hidden lg:block hero-fade-in [animation-delay:120ms]">
          <div className="hud-frame rounded-[10px] border border-rule bg-surface/95 p-4 text-ink">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">{pulseTitle}</span>
              <span className="rounded-md bg-canvas px-2 py-1 font-mono text-xs font-bold text-text-secondary">{pulseStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:gap-4">
              {sourceCards.map(card => (
                <div key={card.label} className="min-h-[140px] rounded-md border border-border bg-background/80 p-4">
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-muted">Source</div>
                  <div className="mt-2 text-base font-semibold text-ink">{card.label}</div>
                  <div className="mt-3 font-mono text-2xl font-bold tnum text-accent-dark">{card.value}</div>
                  <div className="mt-1 min-h-8 text-xs leading-relaxed text-text-secondary">{card.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-border bg-background/80 p-4">
              <div className="flex items-center justify-between font-mono text-xs text-text-muted">
                <span>Validation status</span>
                <span className="font-semibold text-success">Metadata verified</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="Validation status grid">
                {validationItems.map(item => (
                  <span
                    key={item.label}
                    className={`flex min-h-[46px] items-center justify-center rounded-sm border px-1.5 text-center font-mono text-[11px] font-bold uppercase leading-tight ${STATUS_CLASS[item.status]}`}
                    title={`${item.label}: ${statusLabel(item.status)}. ${item.detail}`}
                    aria-label={`${item.label}: ${statusLabel(item.status)}. ${item.detail}`}
                  >
                    <span className="block max-w-full truncate">{item.shortLabel ?? item.label}</span>
                  </span>
                ))}
              </div>
              <table className="sr-only">
                <caption>Validation status details</caption>
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">Status</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {validationItems.map(item => (
                    <tr key={item.label}>
                      <th scope="row">{item.label}</th>
                      <td>{statusLabel(item.status)}</td>
                      <td>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
