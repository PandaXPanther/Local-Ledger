import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME, DATA_SOURCES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-16 bg-[#0F172A] text-gray-400">
      <div className="h-px bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-teal-500/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo-mark.svg" alt="" width={32} height={32} className="h-8 w-8" />
              <span className="text-white font-bold">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Public economic intelligence, built on official data only.
            </p>
            <p className="text-xs mt-3 text-gray-500">
              No fabricated data. No estimates. No hallucinations.
            </p>
            <a
              href="https://buymeacoffee.com/sarast1"
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-colors hover:border-cyan-200/60 hover:bg-cyan-300/20 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h11v6a5 5 0 01-5 5H9a5 5 0 01-5-5V9a1 1 0 011-1zm11 2h2a3 3 0 010 6h-2M7 4h8M8 2v2m4-2v2" />
              </svg>
              Support LocalLedger
            </a>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/states/" className="hover:text-white transition-colors">All States</Link></li>
              <li><Link href="/counties/" className="hover:text-white transition-colors">Counties</Link></li>
              <li><Link href="/metros/" className="hover:text-white transition-colors">Metros</Link></li>
              <li><Link href="/rankings/" className="hover:text-white transition-colors">Rankings</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Dashboards</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/counties/" className="hover:text-white transition-colors">Top Counties</Link></li>
              <li><Link href="/rankings/most-affordable-college-states/" className="hover:text-white transition-colors">College ROI</Link></li>
              <li><Link href="/rankings/federal-spending-per-capita/" className="hover:text-white transition-colors">Federal Spending</Link></li>
              <li><Link href="/rankings/best-local-economies/" className="hover:text-white transition-colors">Best Local Economies</Link></li>
            </ul>
          </div>

          {/* Data & Methodology */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Data & Methodology</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/methodology/" className="hover:text-white transition-colors">Methodology</Link></li>
              <li><Link href="/sources/" className="hover:text-white transition-colors">Sources</Link></li>
              <li><Link href="/api/" className="hover:text-white transition-colors">API / Data Files</Link></li>
              <li><Link href="/about/" className="hover:text-white transition-colors">About</Link></li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Official data from:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(DATA_SOURCES).map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {s.name.split(' (')[0].split(' -')[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} LocalLedger. All data from official public sources.
              Not financial advice.
            </p>
            <p className="text-xs text-gray-500">
              Built with transparency. Every data point cites its source.
            </p>
            <p className="text-xs text-gray-500">
              Built by{' '}
              <a
                href="https://www.linkedin.com/in/saras-totey-64a777334/"
                target="_blank"
                rel="noopener"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Saras Totey
              </a>
            </p>
          </div>
          <Link
            href="/colorado/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
          >
            Featured: Colorado deep-dive
          </Link>
          <a
            href="https://econ.mom"
            target="_blank"
            rel="noopener"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Founder site: econ.mom
          </a>
        </div>
      </div>
    </footer>
  );
}
