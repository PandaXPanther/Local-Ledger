import Link from 'next/link';
import { SITE_NAME, DATA_SOURCES } from '@/lib/constants';
import { BrandMark } from '@/components/BrandLogo';

export function Footer() {
  return (
    <footer className="ledger-ruling-dark mt-16 bg-machine text-cream/75">
      <div className="h-0.5 bg-accent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <BrandMark size={32} className="rounded-md" />
              <span className="font-display text-lg font-black text-cream">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Real data upstairs, a crash-test economy downstairs.
            </p>
            <p className="mt-3 text-xs text-cream/45">
              Every real metric cites its source. The only invented numbers on this site live inside
              the simulator, on purpose, clearly labeled.
            </p>
          </div>

          {/* The Machine */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-bright">The Machine</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/simulator/" className="editorial-link transition-colors">Economy Simulator</Link></li>
              <li><Link href="/simulator/?scenario=hyperinflation" className="editorial-link transition-colors">Run Hyperinflation</Link></li>
              <li><Link href="/simulator/?scenario=crash-1929" className="editorial-link transition-colors">Run the 1929 Crash</Link></li>
              <li><Link href="/simulator/?scenario=stagflation" className="editorial-link transition-colors">Run Stagflation</Link></li>
            </ul>
          </div>

          {/* The Ledger */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cream">The Ledger</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/states/" className="editorial-link transition-colors">All States</Link></li>
              <li><Link href="/counties/" className="editorial-link transition-colors">Counties</Link></li>
              <li><Link href="/metros/" className="editorial-link transition-colors">Metros</Link></li>
              <li><Link href="/rankings/" className="editorial-link transition-colors">Rankings</Link></li>
              <li><Link href="/colorado/" className="editorial-link transition-colors">Colorado Deep-Dive</Link></li>
            </ul>
          </div>

          {/* Data & Methodology */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cream">Data &amp; Methodology</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/methodology/" className="editorial-link transition-colors">Methodology</Link></li>
              <li><Link href="/sources/" className="editorial-link transition-colors">Sources</Link></li>
              <li><Link href="/api/" className="editorial-link transition-colors">API / Data Files</Link></li>
              <li><Link href="/about/" className="editorial-link transition-colors">About</Link></li>
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-xs text-cream/45">Official data from:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(DATA_SOURCES).map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cream/45 transition-colors hover:text-cream"
                  >
                    {s.name.split(' (')[0].split(' -')[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-machine-line pt-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="text-xs text-cream/45">
                © {new Date().getFullYear()} LocalLedger. All real data from official public sources.
                Simulator output is model-generated and labeled as such. Not financial advice.
              </p>
              <p className="text-xs text-cream/45">
                Built by a student who thinks economics should be something you can touch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://buymeacoffee.com/sarast1"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-md border border-accent-bright/40 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:border-accent-bright hover:text-accent-bright"
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
                className="text-xs text-cream/45 transition-colors hover:text-cream"
              >
                Saras Totey on LinkedIn
              </a>
              <a
                href="https://econ.mom"
                target="_blank"
                rel="noopener"
                className="text-xs text-cream/45 transition-colors hover:text-cream"
              >
                Founder site: econ.mom
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
