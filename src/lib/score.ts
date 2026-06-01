/**
 * Local Economy Score computation.
 * Weights: labor 30, income 25, affordability 20, population 15, fiscal 10.
 * All inputs normalized to 0-100 sub-scores before weighting.
 */

import { LOCAL_ECONOMY_SCORE_WEIGHTS } from './constants';
import type { LocalEconomyScoreBreakdown } from '@/types/data';

interface ScoreInputs {
  // Labor (30): unemployment rate lower = better
  unemploymentRate: number | null;         // percent, e.g. 3.5
  laborForceParticipationRate: number | null; // percent, e.g. 68

  // Income (25): median household income relative to CO median
  medianHouseholdIncome: number | null;    // USD
  coloradoMedianIncome: number;            // USD, reference

  // Affordability (20): home price-to-income ratio lower = better
  medianHomeValue: number | null;          // USD
  incomeForAffordability: number | null;   // USD

  // Population (15): growth rate
  populationGrowthRate: number | null;     // percent YoY

  // Fiscal (10): federal spending per capita
  federalSpendingPerCapita: number | null; // USD

  sources: string[];
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Normalize unemployment rate to 0-100 (0% unemployment = 100, 15%+ = 0).
 */
function scoreUnemployment(rate: number | null): number | null {
  if (rate === null) return null;
  return clamp(100 - (rate / 15) * 100);
}

/**
 * Normalize LFP rate to 0-100 (80%+ = 100, 50% = 0).
 */
function scoreLfpr(lfpr: number | null): number | null {
  if (lfpr === null) return null;
  return clamp(((lfpr - 50) / 30) * 100);
}

/**
 * Normalize median HH income relative to CO median.
 * At 2× CO median → 100; at 0 → 0.
 */
function scoreIncome(income: number | null, coMedian: number): number | null {
  if (income === null) return null;
  return clamp((income / (coMedian * 2)) * 100);
}

/**
 * Normalize home price-to-income ratio.
 * Ratio 2× = 100 (very affordable); 10× = 0.
 */
function scoreAffordability(homeValue: number | null, income: number | null): number | null {
  if (homeValue === null || income === null || income <= 0) return null;
  const ratio = homeValue / income;
  return clamp(100 - ((ratio - 2) / 8) * 100);
}

/**
 * Normalize population growth.
 * 3%+ = 100; -2% = 0.
 */
function scorePopulationGrowth(growth: number | null): number | null {
  if (growth === null) return null;
  return clamp(((growth + 2) / 5) * 100);
}

/**
 * Normalize federal spending per capita.
 * $20k+ = 100; 0 = 0.
 */
function scoreFiscal(perCapita: number | null): number | null {
  if (perCapita === null) return null;
  return clamp((perCapita / 20000) * 100);
}

export function computeLocalEconomyScore(inputs: ScoreInputs): LocalEconomyScoreBreakdown {
  const uScore = scoreUnemployment(inputs.unemploymentRate);
  const lfprScore = scoreLfpr(inputs.laborForceParticipationRate);
  const laborRaw =
    uScore !== null && lfprScore !== null
      ? (uScore * 0.7 + lfprScore * 0.3)
      : (uScore ?? lfprScore ?? null);

  const incomeScore = scoreIncome(inputs.medianHouseholdIncome, inputs.coloradoMedianIncome);
  const affordScore = scoreAffordability(inputs.medianHomeValue, inputs.incomeForAffordability);
  const popScore = scorePopulationGrowth(inputs.populationGrowthRate);
  const fiscalScore = scoreFiscal(inputs.federalSpendingPerCapita);

  const components: Record<string, { score: number | null; weight: number }> = {
    labor: { score: laborRaw, weight: LOCAL_ECONOMY_SCORE_WEIGHTS.labor },
    income: { score: incomeScore, weight: LOCAL_ECONOMY_SCORE_WEIGHTS.income },
    affordability: { score: affordScore, weight: LOCAL_ECONOMY_SCORE_WEIGHTS.affordability },
    population: { score: popScore, weight: LOCAL_ECONOMY_SCORE_WEIGHTS.population },
    fiscal: { score: fiscalScore, weight: LOCAL_ECONOMY_SCORE_WEIGHTS.fiscal },
  };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const [, { score, weight }] of Object.entries(components)) {
    if (score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  const total = totalWeight > 0 ? clamp(Math.round(weightedSum / totalWeight)) : 0;

  return {
    total,
    labor: Math.round(laborRaw ?? 0),
    income: Math.round(incomeScore ?? 0),
    affordability: Math.round(affordScore ?? 0),
    population: Math.round(popScore ?? 0),
    fiscal: Math.round(fiscalScore ?? 0),
    methodologyNote:
      'Local Economy Score (0-100) is a weighted composite: Labor 30%, Income 25%, Affordability 20%, Population Growth 15%, Federal Fiscal 10%. Sub-scores are normalized from official public data. Missing components reduce effective weight proportionally.',
    sources: inputs.sources,
  };
}
