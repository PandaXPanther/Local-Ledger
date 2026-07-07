'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EXPLORE_LINKS, NAV_LINKS } from '@/lib/constants';
import { BrandLockup, BrandMark } from '@/components/BrandLogo';

interface SearchItem {
  label: string;
  type: string;
  href: string;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const exploreRef = useRef<HTMLDivElement | null>(null);

  async function loadSearch() {
    if (items.length > 0) return;
    const res = await fetch('/data/processed/search-index.json');
    if (res.ok) {
      const json = await res.json() as { items?: SearchItem[] };
      setItems(json.items ?? []);
    }
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(item => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [items, query]);

  useEffect(() => {
    if (!exploreOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!exploreRef.current?.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [exploreOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-rule bg-background/95 backdrop-blur" role="navigation" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="LocalLedger home">
            <BrandLockup />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/simulator/"
              className="mr-1 rounded-md border border-accent/50 bg-accent-soft/60 px-3 py-1.5 text-sm font-semibold text-accent-dark transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              Simulator
            </Link>
            <div ref={exploreRef} className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen(value => !value)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-canvas hover:text-ink"
                aria-expanded={exploreOpen}
              >
                Explore
              </button>
              {exploreOpen && (
                <div className="absolute left-0 top-11 w-[520px] rounded-[10px] border border-rule bg-surface p-4 shadow-[0_16px_40px_rgba(24,20,16,0.12)]">
                  <div className="grid grid-cols-2 gap-2">
                    {EXPLORE_LINKS.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-canvas hover:text-ink"
                        onClick={() => setExploreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.filter(link => link.label !== 'Explore' && link.label !== 'Simulator').map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-canvas hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="relative hidden w-64 lg:block">
            <input
              type="search"
              value={query}
              onFocus={loadSearch}
              onChange={event => {
                setQuery(event.target.value);
                void loadSearch();
              }}
              placeholder="Search places"
              className="w-full rounded-md border border-border bg-surface px-4 py-2 pr-12 font-mono text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search places"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 rounded border border-border bg-canvas px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-muted">
              /
            </span>
            {matches.length > 0 && (
              <div className="absolute right-0 top-11 w-full overflow-hidden rounded-[10px] border border-rule bg-surface shadow-[0_16px_40px_rgba(24,20,16,0.12)]">
                {matches.map(item => (
                  <Link
                    key={`${item.type}-${item.href}`}
                    href={item.href}
                    className="block px-3 py-2 text-sm transition-colors hover:bg-canvas"
                    onClick={() => setQuery('')}
                  >
                    <span className="font-medium text-text-primary">{item.label}</span>
                    <span className="ml-2 font-mono text-xs text-text-muted">{item.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-text-secondary hover:bg-canvas hover:text-ink md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
          <div className="ml-auto h-full w-80 max-w-[86vw] bg-surface p-5 shadow-xl" onClick={event => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BrandMark size={30} className="rounded-md border border-ink/15" />
                <span className="font-display text-lg font-black text-ink">LocalLedger</span>
              </span>
              <button type="button" className="rounded-md p-2 hover:bg-canvas" onClick={() => setOpen(false)} aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              <Link
                href="/simulator/"
                className="block rounded-md border border-accent/50 bg-accent-soft/60 px-3 py-2 text-sm font-semibold text-accent-dark"
                onClick={() => setOpen(false)}
              >
                Economy Simulator
              </Link>
              {[...NAV_LINKS.filter(link => link.label !== 'Simulator'), ...EXPLORE_LINKS.filter(link => link.label !== 'States')].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-canvas hover:text-ink"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
