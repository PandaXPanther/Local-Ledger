import Link from 'next/link';
import { SITE_NAME, DATA_SOURCES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-white font-bold">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Public economic intelligence, built on official data only.
            </p>
            <p className="text-xs mt-3 text-gray-500">
              No fabricated data. No estimates. No hallucinations.
            </p>
          </div>

          {/* Colorado */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Colorado</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/colorado/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/colorado/denver/" className="hover:text-white transition-colors">Denver</Link></li>
              <li><Link href="/colorado/boulder/" className="hover:text-white transition-colors">Boulder</Link></li>
              <li><Link href="/colorado/colorado-springs/" className="hover:text-white transition-colors">Colorado Springs</Link></li>
              <li><Link href="/colorado/fort-collins/" className="hover:text-white transition-colors">Fort Collins</Link></li>
              <li><Link href="/colorado/aurora/" className="hover:text-white transition-colors">Aurora</Link></li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Dashboards</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/colorado/counties/" className="hover:text-white transition-colors">64 Counties</Link></li>
              <li><Link href="/colorado/college-roi/" className="hover:text-white transition-colors">College ROI</Link></li>
              <li><Link href="/colorado/federal-spending/" className="hover:text-white transition-colors">Federal Spending</Link></li>
              <li><Link href="/colorado/recession-radar/" className="hover:text-white transition-colors">Recession Radar</Link></li>
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
