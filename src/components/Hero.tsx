import Link from 'next/link';

interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tag?: string;
}

export function Hero({ headline, subheadline, primaryCta, secondaryCta, tag }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1728_48%,#12213a_100%)]" />
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
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Colorado pulse</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Official sources</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['FRED', 'Census', 'BEA', 'USAspending'].map(label => (
                <div key={label} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Source</div>
                  <div className="mt-3 text-lg font-semibold text-white">{label}</div>
                  <div className="mt-4 h-12 rounded-md border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),transparent_60%)]" />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Validation status</span>
                <span className="text-cyan-200">Source metadata required</span>
              </div>
              <div className="mt-3 grid grid-cols-12 gap-1">
                {Array.from({ length: 36 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-8 rounded-sm bg-cyan-400/20"
                    style={{ opacity: 0.3 + ((index % 7) * 0.08) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
