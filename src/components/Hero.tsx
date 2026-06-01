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
  pass: 'border-accent/20 bg-accent-soft text-accent',
  warn: 'border-ember/25 bg-ember-soft text-ember',
  fail: 'border-danger/20 bg-red-50 text-danger',
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
    <section className="relative overflow-hidden border-b border-rule bg-canvas text-text-primary">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(250,250,247,0.92)_0%,rgba(244,241,234,0.84)_48%,rgba(228,238,230,0.88)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-ember to-data" />
      <svg
        className="pointer-events-none absolute left-1/2 top-16 hidden h-72 w-[760px] -translate-x-1/2 text-accent/10 lg:block"
        viewBox="0 0 760 260"
        aria-hidden="true"
      >
        <path d="M8 210 C 80 178, 118 204, 182 158 S 294 88, 370 124 486 184, 556 116 678 66, 752 98" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
        <path d="M8 210 C 80 178, 118 204, 182 158 S 294 88, 370 124 486 184, 556 116 678 66, 752 98" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent/25" />
      </svg>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="hero-fade-in">
          {tag && (
            <span className="mb-5 inline-flex rounded-full border border-accent/20 bg-surface/75 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent shadow-sm">
              {tag}
            </span>
          )}
          <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.96] text-ink sm:text-6xl lg:text-7xl">
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
          <div className="rounded-lg border border-rule bg-surface/90 p-4 shadow-[0_30px_80px_rgba(31,36,33,0.12)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">{pulseTitle}</span>
              <span className="rounded-full bg-accent-soft px-2 py-1 font-mono text-xs font-bold text-accent">{pulseStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sourceCards.map(card => (
                <div key={card.label} className="rounded-md border border-border bg-background/70 p-4">
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-text-muted">Source</div>
                  <div className="mt-2 text-base font-semibold text-ink">{card.label}</div>
                  <div className="mt-3 font-mono text-2xl font-bold text-accent">{card.value}</div>
                  <div className="mt-1 min-h-8 text-xs leading-relaxed text-text-secondary">{card.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-border bg-background/70 p-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Validation status</span>
                <span className="font-semibold text-accent">Metadata verified</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="Validation status grid">
                {validationItems.map(item => (
                  <span
                    key={item.label}
                    className={`flex h-10 items-center justify-center rounded-sm border px-1 text-center font-mono text-[10px] font-bold uppercase leading-tight ${STATUS_CLASS[item.status]}`}
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
