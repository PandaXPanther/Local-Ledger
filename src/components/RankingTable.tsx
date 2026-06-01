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
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-text-secondary">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Place</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(row => (
            <tr key={`${row.rank}-${row.href}`}>
              <td className="px-4 py-3 font-semibold">{row.rank}</td>
              <td className="px-4 py-3 font-medium"><Link href={row.href} className="text-brand-blue hover:underline">{row.name}</Link></td>
              <td className="px-4 py-3">{row.value}</td>
              <td className="px-4 py-3 text-text-secondary">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
