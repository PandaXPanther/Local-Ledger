import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME, DATA_SOURCES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-400 mt-16">
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
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/colorado/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/states/" className="hover:text-white transition-colors">States</Link></li>
              <li><Link href="/counties/" className="hover:text-white transition-colors">Counties</Link></li>
              <li><Link href="/metros/" className="hover:text-white transition-colors">Metros</Link></li>
              <li><Link href="/rankings/" className="hover:text-white transition-colors">Rankings</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Dashboards</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/states/colorado/counties/" className="hover:text-white transition-colors">Colorado Counties</Link></li>
              <li><Link href="/states/colorado/college-roi/" className="hover:text-white transition-colors">College ROI</Link></li>
              <li><Link href="/states/colorado/federal-spending/" className="hover:text-white transition-colors">Federal Spending</Link></li>
              <li><Link href="/states/colorado/recession-radar/" className="hover:text-white transition-colors">Recession Radar</Link></li>
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
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LocalLedger. All data from official public sources.
            Not financial advice.
          </p>
          <p className="text-xs text-gray-500">
            Built with transparency. Every data point cites its source.
          </p>
        </div>
      </div>
    </footer>
  );
}
