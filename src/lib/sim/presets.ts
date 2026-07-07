import type { Preset } from './types';

/**
 * Preset scenarios. Each one is a set of dial positions that reproduces the
 * conditions behind a famous economic episode, plus a note on what to watch.
 * Numbers are stylized, not calibrated history.
 */

export const PRESETS: Preset[] = [
  {
    id: 'baseline',
    name: 'Steady State',
    era: 'A well-run 2020s economy',
    tagline: 'Boring on purpose.',
    description:
      'Mainstream settings: an independent central bank targeting 2 percent inflation, moderate taxes, insured deposits, open trade. The reference point every other scenario is measured against.',
    watchFor: 'Gentle cycles around 2 percent inflation and full employment. This is what success looks like: nothing happening.',
    overrides: {},
  },
  {
    id: 'hyperinflation',
    name: 'Hyperinflation',
    era: 'Germany, 1921-1923',
    tagline: 'The printer pays the bills.',
    description:
      'The government spends heavily, collects little, and orders the central bank to print the difference. Expectations unanchor, and prices stop meaning anything.',
    watchFor: 'Inflation compounding on itself once expectations unanchor, the currency collapsing, and happiness cratering even while nominal numbers soar.',
    overrides: {
      govSpending: 45,
      taxRate: 12,
      deficitMonetization: 100,
      moneyPrinting: 200,
      cbAuto: false,
      policyRateManual: 2,
      confidence: 0.9,
    },
  },
  {
    id: 'debt-crisis',
    name: 'Sovereign Debt Crisis',
    era: 'Greece, 2010-2015',
    tagline: 'Borrowed in a currency you cannot print.',
    description:
      'Debt starts at 150 percent of GDP, tax collection is weak, and the currency is pegged, so devaluing or printing your way out is off the table. Bond markets are watching closely.',
    watchFor: 'Yields spiking as debt grows, austerity arithmetic failing, and the default event: a bond haircut that wounds the banks holding the debt.',
    overrides: {
      goldStandard: true,
      goldCoverRatio: 40,
      taxRate: 22,
      govSpending: 30,
      safetyNet: 6,
      bondVigilance: 2.5,
      deficitMonetization: 0,
    },
    init: { debtToGdp: 150 },
  },
  {
    id: 'crash-1929',
    name: 'Stock Market Crash',
    era: 'United States, 1929',
    tagline: 'Margin all the way up. Margin all the way down.',
    description:
      'Maximum speculation and margin leverage, banks with no deposit insurance and no bailouts coming, money pinned to gold. The bubble is not a risk here; it is the plan.',
    watchFor: 'The index detaching from fair value, the crash, then the second disaster: uninsured bank runs and a credit collapse that turns a correction into a depression.',
    overrides: {
      speculation: 2,
      marginLeverage: 3,
      lendingAppetite: 1.8,
      depositInsurance: false,
      bailoutPolicy: false,
      goldStandard: true,
      goldCoverRatio: 45,
      safetyNet: 0.5,
      qe: 0,
    },
  },
  {
    id: 'stagflation',
    name: 'Stagflation',
    era: 'United States, 1973-1980',
    tagline: 'Everything bad at once.',
    description:
      'Oil quadruples, unions index wages to prices, productivity stalls, and the central bank keeps rates too low because it fears unemployment more than inflation.',
    watchFor: 'The textbook impossibility: inflation and unemployment rising together. Then try flipping the Taylor rule on with high aggressiveness and price the Volcker cure.',
    overrides: {
      oilShock: 3.5,
      unionPower: 0.8,
      productivityGrowth: 0.4,
      cbAuto: false,
      policyRateManual: 5,
    },
  },
  {
    id: 'housing-2008',
    name: 'Housing Bubble',
    era: 'United States, 2003-2009',
    tagline: 'Houses only go up, until the quarter they do not.',
    description:
      'Rates held near the floor, mortgages above 100 percent of home value, thin bank capital, and heavy property speculation. Bailouts are on, which is its own lesson.',
    watchFor: 'House prices outrunning rents and wages, the foreclosure crash landing on bank balance sheets, the bailout, and the moral hazard meter it leaves behind.',
    overrides: {
      cbAuto: false,
      policyRateManual: 1.5,
      maxLTV: 105,
      propertySpeculation: 1.8,
      lendingAppetite: 1.7,
      speculation: 1.2,
      capitalRequirement: 4,
      bailoutPolicy: true,
    },
  },
  {
    id: 'trade-war',
    name: 'Trade War',
    era: 'Smoot-Hawley, 1930',
    tagline: 'Nobody wins. Everybody pays retail.',
    description:
      'Tariffs near 45 percent, trading partners mirroring every one of them back. Protection for a few industries, higher prices for everyone else.',
    watchFor: 'Exports and imports both shrinking, tariff revenue never covering the lost trade, and inflation ticking up while growth sags.',
    overrides: {
      tariffRate: 45,
      retaliation: 100,
      tradeOpenness: 1.2,
    },
  },
  {
    id: 'gold-deflation',
    name: 'Gold Standard Deflation',
    era: 'The Long Depression, 1873-1896',
    tagline: 'Sound money, falling prices, angry farmers.',
    description:
      'A growing economy chained to a fixed money supply with a high gold cover. Every year of real growth must be paid for with lower prices, and debts get heavier in real terms.',
    watchFor: 'Persistent deflation, real debt burdens climbing, and why William Jennings Bryan gave a speech about a cross of gold.',
    overrides: {
      goldStandard: true,
      goldCoverRatio: 90,
      productivityGrowth: 2.2,
      wageFlexibility: 0.2,
      qe: 0,
    },
  },
  {
    id: 'helicopter',
    name: 'Helicopter Season',
    era: 'The MMT stress test',
    tagline: 'Deficits do not matter, until the quarter they do.',
    description:
      'A maximal fiscal program: universal coverage, a thick safety net, heavy education spending, and 80 percent of the deficit financed by money creation. The theory says idle capacity will absorb it.',
    watchFor: 'Happiness and coverage jumping first. Then watch whether inflation stays polite once the output gap closes. The model has an opinion.',
    overrides: {
      govSpending: 40,
      taxRate: 20,
      deficitMonetization: 80,
      safetyNet: 8,
      publicCoverage: 90,
      publicHealthSpend: 10,
      educationSpend: 9,
    },
  },
  {
    id: 'night-watchman',
    name: 'Night Watchman State',
    era: 'The libertarian stress test',
    tagline: 'The market will provide. Mostly.',
    description:
      'Taxes near 8 percent, spending near 6, no safety net, no minimum wage, no deposit insurance, no bailouts, banks lightly regulated and eager. Growth is real; so is the fragility.',
    watchFor: 'Strong average growth punctuated by uninsured bank runs, plus what happens to homelessness, coverage, and mobility when the floor is removed.',
    overrides: {
      taxRate: 8,
      govSpending: 6,
      safetyNet: 0,
      minWageLevel: 0,
      publicCoverage: 0,
      publicHealthSpend: 0.5,
      educationSpend: 1.5,
      capitalRequirement: 3,
      depositInsurance: false,
      bailoutPolicy: false,
      lendingAppetite: 1.6,
    },
  },
  {
    id: 'high-trust',
    name: 'High-Trust Model',
    era: 'The Nordic settings',
    tagline: 'Expensive. Works.',
    description:
      'Taxes near 45 percent buying universal health coverage, heavy education investment, strong unions, a generous safety net, and low discrimination. The question is what it costs in dynamism.',
    watchFor: 'High happiness, mobility, and coverage. Compare growth and unemployment against Steady State and decide if the trade is worth it. There is no free answer.',
    overrides: {
      taxRate: 45,
      govSpending: 30,
      educationSpend: 9,
      publicHealthSpend: 9,
      publicCoverage: 100,
      safetyNet: 8,
      wealthTax: 1,
      unionPower: 0.7,
      minWageLevel: 0.5,
      discrimination: 0.05,
    },
  },
  {
    id: 'exclusion',
    name: 'The Exclusion Economy',
    era: 'Jim Crow economics',
    tagline: 'Discrimination is expensive for everyone.',
    description:
      'Labor market discrimination at 0.85: a large share of the population walled off from jobs, credit, and schools, with a threadbare safety net behind them.',
    watchFor: 'The permanent unemployment gap, mobility collapsing, and the part textbooks underline: total output is lower for everyone, not just the excluded.',
    overrides: {
      discrimination: 0.85,
      safetyNet: 1,
      educationSpend: 3,
    },
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find(preset => preset.id === id);
}
