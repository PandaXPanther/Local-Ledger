import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME, DATA_SOURCES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-[#CFC7B6]">
      <div className="h-px bg-gradient-to-r from-accent/60 via-ember/60 to-accent/60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo-mark.svg" alt="" width={32} height={32} className="h-8 w-8" />
              <span className="font-display text-lg font-bold text-background">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Public economic intelligence, built on official data only.
            </p>
            <p className="mt-3 text-xs text-[#9C9484]">
              No fabricated values. No AI-generated data. No unsourced or model-imputed numbers.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-background">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/states/" className="editorial-link transition-colors">All States</Link></li>
              <li><Link href="/counties/" className="editorial-link transition-colors">Counties</Link></li>
              <li><Link href="/metros/" className="editorial-link transition-colors">Metros</Link></li>
              <li><Link href="/rankings/" className="editorial-link transition-colors">Rankings</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-background">Dashboards</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/counties/" className="editorial-link transition-colors">Top Counties</Link></li>
              <li><Link href="/rankings/most-affordable-college-states/" className="editorial-link transition-colors">College ROI</Link></li>
              <li><Link href="/rankings/federal-spending-per-capita/" className="editorial-link transition-colors">Federal Spending</Link></li>
              <li><Link href="/rankings/best-local-economies/" className="editorial-link transition-colors">Best Local Economies</Link></li>
            </ul>
          </div>

          {/* Data & Methodology */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-background">Data & Methodology</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/methodology/" className="editorial-link transition-colors">Methodology</Link></li>
              <li><Link href="/sources/" className="editorial-link transition-colors">Sources</Link></li>
              <li><Link href="/api/" className="editorial-link transition-colors">API / Data Files</Link></li>
              <li><Link href="/about/" className="editorial-link transition-colors">About</Link></li>
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-xs text-[#9C9484]">Official data from:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(DATA_SOURCES).map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#9C9484] transition-colors hover:text-background"
                  >
                    {s.name.split(' (')[0].split(' -')[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-background/10 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="text-xs text-[#9C9484]">
                © {new Date().getFullYear()} LocalLedger. All data from official public sources.
                Not financial advice.
              </p>
              <p className="text-xs text-[#9C9484]">
                Built with transparency. Every data point cites its source.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://buymeacoffee.com/sarast1"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-background transition-colors hover:border-accent hover:bg-accent/25"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h11v6a5 5 0 01-5 5H9a5 5 0 01-5-5V9a1 1 0 011-1zm11 2h2a3 3 0 010 6h-2M7 4h8M8 2v2m4-2v2" />
                </svg>
                Support LocalLedger
              </a>
              <a
                href="https://www.linkedin.com/in/saras-totey-64a777334/"
                target="_blank"
                rel="noopener"
                className="text-xs text-[#9C9484] transition-colors hover:text-background"
              >
                Saras Totey on LinkedIn
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <a
              href="https://econ.mom"
              target="_blank"
              rel="noopener"
              className="text-xs text-[#9C9484] transition-colors hover:text-background"
            >
              Founder site: econ.mom
            </a>
            <Link
              href="/colorado/"
              className="inline-flex items-center rounded-full border border-background/10 bg-background/5 px-3 py-1.5 text-xs font-semibold text-[#CFC7B6] transition-colors hover:border-accent/60 hover:bg-accent/15 hover:text-background"
            >
              Featured: Colorado deep-dive
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
