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
  pass: 'border-emerald-300/30 bg-emerald-400/25 text-emerald-100',
  warn: 'border-amber-300/40 bg-amber-400/25 text-amber-100',
  fail: 'border-rose-300/40 bg-rose-400/25 text-rose-100',
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
    <section className="relative overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1728_48%,#12213a_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:24px_24px] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div>
          {tag && (
            <span className="inline-flex mb-5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
              {tag}
            </span>
          )}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryCta && (
              <Link href={primaryCta.href} className="btn-primary bg-cyan-500 px-7 py-3 text-base hover:bg-cyan-400">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-200">{pulseTitle}</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">{pulseStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sourceCards.map(card => (
                <div key={card.label} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Source</div>
                  <div className="mt-2 text-base font-semibold text-white">{card.label}</div>
                  <div className="mt-3 text-2xl font-bold text-cyan-100">{card.value}</div>
                  <div className="mt-1 min-h-8 text-xs leading-relaxed text-slate-300">{card.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Validation status</span>
                <span className="text-cyan-200">Metadata verified</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="Validation status grid">
                {validationItems.map(item => (
                  <span
                    key={item.label}
                    className={`flex h-10 items-center justify-center rounded-sm border px-1 text-center text-[10px] font-semibold uppercase leading-tight ${STATUS_CLASS[item.status]}`}
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
