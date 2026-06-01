import { computeLocalEconomyScore } from '../lib/score';

describe('computeLocalEconomyScore', () => {
  const BASE_INPUTS = {
    unemploymentRate: 3.5,
    laborForceParticipationRate: 68,
    medianHouseholdIncome: 80000,
    coloradoMedianIncome: 75000,
    medianHomeValue: 450000,
    incomeForAffordability: 80000,
    populationGrowthRate: 1.5,
    federalSpendingPerCapita: 12000,
    sources: ['FRED', 'Census ACS'],
  };

  it('returns a score between 0 and 100', () => {
    const result = computeLocalEconomyScore(BASE_INPUTS);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('has a methodology note', () => {
    const result = computeLocalEconomyScore(BASE_INPUTS);
    expect(result.methodologyNote).toBeTruthy();
    expect(result.methodologyNote.length).toBeGreaterThan(20);
  });

  it('returns 0 total for all null inputs', () => {
    const result = computeLocalEconomyScore({
      unemploymentRate: null,
      laborForceParticipationRate: null,
      medianHouseholdIncome: null,
      coloradoMedianIncome: 75000,
      medianHomeValue: null,
      incomeForAffordability: null,
      populationGrowthRate: null,
      federalSpendingPerCapita: null,
      sources: [],
    });
    expect(result.total).toBe(0);
  });

  it('low unemployment produces higher labor score', () => {
    const low = computeLocalEconomyScore({ ...BASE_INPUTS, unemploymentRate: 2.0 });
    const high = computeLocalEconomyScore({ ...BASE_INPUTS, unemploymentRate: 8.0 });
    expect(low.labor).toBeGreaterThan(high.labor);
  });

  it('scores are integers', () => {
    const result = computeLocalEconomyScore(BASE_INPUTS);
    expect(Number.isInteger(result.total)).toBe(true);
    expect(Number.isInteger(result.labor)).toBe(true);
    expect(Number.isInteger(result.income)).toBe(true);
  });
});
