import Link from 'next/link';

export interface RankingRow {
  rank: number;
  name: string;
  href: string;
  value: string;
  detail: string;
}

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  return (
    <div className="table-shell">
      <table className="w-full text-sm">
        <thead className="table-head">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Place</th>
            <th className="px-4 py-3 text-right">Value</th>
            <th className="px-4 py-3">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map(row => (
            <tr key={`${row.rank}-${row.href}`} className="table-row">
              <td className="px-4 py-3 font-mono font-bold text-text-muted">{row.rank}</td>
              <td className="px-4 py-3 font-semibold"><Link href={row.href} className="editorial-link text-accent">{row.name}</Link></td>
              <td className="px-4 py-3 text-right font-mono font-bold text-ink">{row.value}</td>
              <td className="px-4 py-3 text-text-secondary">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
