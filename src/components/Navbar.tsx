'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EXPLORE_LINKS, NAV_LINKS } from '@/lib/constants';

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
    <nav className="sticky top-0 z-50 border-b border-rule bg-background/92 shadow-[0_1px_0_rgba(31,36,33,0.05)] backdrop-blur" role="navigation" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="LocalLedger home">
            <Image src="/logo-lockup.svg" alt="LocalLedger" width={180} height={42} priority className="h-9 w-auto" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div ref={exploreRef} className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen(value => !value)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent"
                aria-expanded={exploreOpen}
              >
                Explore
              </button>
              {exploreOpen && (
                <div className="absolute left-0 top-11 w-[520px] rounded-lg border border-rule bg-surface p-4 shadow-[0_24px_70px_rgba(31,36,33,0.14)]">
                  <div className="grid grid-cols-2 gap-2">
                    {EXPLORE_LINKS.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent"
                        onClick={() => setExploreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.filter(link => link.label !== 'Explore').map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent"
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
              placeholder="Search places  /"
              className="w-full rounded-full border border-border bg-surface px-4 py-2 pr-14 font-mono text-sm shadow-inner placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search places"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-border bg-canvas px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
              /
            </span>
            {matches.length > 0 && (
              <div className="absolute right-0 top-11 w-full overflow-hidden rounded-lg border border-rule bg-surface shadow-[0_20px_60px_rgba(31,36,33,0.14)]">
                {matches.map(item => (
                  <Link
                    key={`${item.type}-${item.href}`}
                    href={item.href}
                    className="block px-3 py-2 text-sm transition-colors hover:bg-accent-soft"
                    onClick={() => setQuery('')}
                  >
                    <span className="font-medium text-text-primary">{item.label}</span>
                    <span className="ml-2 text-xs text-text-muted">{item.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-text-secondary hover:bg-accent-soft hover:text-accent md:hidden"
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
        <div className="fixed inset-0 z-50 bg-ink/35 md:hidden" onClick={() => setOpen(false)}>
          <div className="ml-auto h-full w-80 max-w-[86vw] bg-surface p-5 shadow-xl" onClick={event => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <Image src="/logo-lockup.svg" alt="LocalLedger" width={160} height={38} className="h-8 w-auto" />
              <button type="button" className="rounded-lg p-2 hover:bg-accent-soft" onClick={() => setOpen(false)} aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {[...NAV_LINKS, ...EXPLORE_LINKS.filter(link => link.label !== 'States')].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-accent-soft hover:text-accent"
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
