import { formatPercent, formatCurrency } from '@/lib/format';
import type { DataPoint } from '@/types/data';

interface CityRow {
  city: string;
  unemploymentRate: DataPoint | null;
  medianHouseholdIncome?: DataPoint | null;
  localEconomyScore?: DataPoint | null;
}

interface CityComparisonTableProps {
  cities: CityRow[];
  stateAvg?: {
    unemploymentRate?: number | null;
    medianHouseholdIncome?: number | null;
  };
}

function displayRate(dp: DataPoint | null): string {
  if (!dp || dp.value === null) return 'N/A';
  return formatPercent(dp.value);
}

function displayIncome(dp: DataPoint | null): string {
  if (!dp || dp.value === null) return 'N/A';
  return formatCurrency(dp.value);
}

function displayScore(dp: DataPoint | null): string {
  if (!dp || dp.value === null) return 'N/A';
  return String(Math.round(dp.value));
}

export function CityComparisonTable({ cities, stateAvg }: CityComparisonTableProps) {
  return (
    <div className="table-shell overflow-x-auto">
      <table className="w-full text-sm" aria-label="Colorado city economic comparison">
        <thead className="table-head">
          <tr>
            <th className="px-4 py-3 text-left">City</th>
            <th className="px-4 py-3 text-right">Unemployment Rate</th>
            <th className="px-4 py-3 text-right">Median HH Income</th>
            <th className="px-4 py-3 text-right">Economy Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {stateAvg && (
            <tr className="bg-accent-soft/65">
              <td className="px-4 py-3 font-semibold text-accent">Colorado (state)</td>
              <td className="px-4 py-3 text-right font-mono">
                {stateAvg.unemploymentRate !== null && stateAvg.unemploymentRate !== undefined
                  ? formatPercent(stateAvg.unemploymentRate)
                  : <span className="unavailable-badge">N/A</span>}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {stateAvg.medianHouseholdIncome !== null && stateAvg.medianHouseholdIncome !== undefined
                  ? formatCurrency(stateAvg.medianHouseholdIncome)
                  : <span className="unavailable-badge">N/A</span>}
              </td>
              <td className="px-4 py-3 text-right font-mono text-text-muted">-</td>
            </tr>
          )}
          {cities.map((c) => (
            <tr key={c.city} className="table-row">
              <td className="px-4 py-3 font-medium text-text-primary">{c.city}</td>
              <td className="px-4 py-3 text-right font-mono">
                {c.unemploymentRate?.value !== null
                  ? displayRate(c.unemploymentRate)
                  : <span className="unavailable-badge">N/A</span>}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {displayIncome(c.medianHouseholdIncome ?? null) !== 'N/A'
                  ? displayIncome(c.medianHouseholdIncome ?? null)
                  : <span className="unavailable-badge">N/A</span>}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {c.localEconomyScore && c.localEconomyScore.value !== null
                  ? <span className="font-bold text-accent">{displayScore(c.localEconomyScore)}</span>
                  : <span className="unavailable-badge">N/A</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
