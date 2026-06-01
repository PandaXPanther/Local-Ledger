'use client';

import { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pageSize?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  searchable = false,
  searchKeys,
  pageSize = 25,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      (searchKeys ?? (columns.map(c => c.key))).some(k => {
        const v = row[k];
        return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = useMemo(() => {
    return sorted.slice(page * pageSize, (page + 1) * pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search table"
            />
          </div>
          <span className="text-xs text-text-muted">{sorted.length} results</span>
        </div>
      )}

      <div className="table-shell overflow-x-auto">
        <table className="w-full text-sm" aria-label={caption}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="table-head">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-4 py-3 ${alignClass[col.align ?? 'left']} ${col.sortable ? 'cursor-pointer select-none hover:bg-accent-soft' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="flex items-center gap-1 justify-start">
                    {col.label}
                    {col.sortable && (
                      <svg className={`h-3 w-3 ${sortKey === col.key ? 'text-accent' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDir === 'asc' && sortKey === col.key ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                  No data available
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} className="table-row">
                  {columns.map(col => (
                    <td key={String(col.key)} className={`px-4 py-3 ${alignClass[col.align ?? 'left']} ${col.align === 'right' ? 'font-mono tabular-nums' : ''}`}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] !== null && row[col.key] !== undefined
                          ? String(row[col.key])
                          : <span className="unavailable-badge">N/A</span>
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-accent-soft disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-accent-soft disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
