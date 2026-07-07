import type { ParamDef, ParamGroup, SimParams } from './types';

/**
 * Every dial in the Machine. Each definition carries an educational note that
 * the UI surfaces next to the control, so moving a dial teaches the mechanism.
 */

export const DEFAULT_PARAMS: SimParams = {
  // Government
  taxRate: 26,
  corporateTax: 21,
  wealthTax: 0,
  govSpending: 22,
  educationSpend: 5,
  publicHealthSpend: 4,
  safetyNet: 3,
  minWageLevel: 0.35,
  deficitMonetization: 0,
  bondVigilance: 1,

  // Central bank
  cbAuto: true,
  policyRateManual: 4,
  inflationTarget: 2,
  taylorAggressiveness: 1.5,
  moneyPrinting: 0,
  qe: 1,
  goldStandard: false,
  goldCoverRatio: 40,

  // Banking
  reserveRequirement: 10,
  capitalRequirement: 9,
  depositInsurance: true,
  bailoutPolicy: true,
  lendingAppetite: 1,

  // Markets
  speculation: 0.8,
  marginLeverage: 1,

  // Trade
  tariffRate: 3,
  retaliation: 50,
  tradeOpenness: 1,
  foreignDemand: 1,

  // Labor and society
  discrimination: 0.15,
  immigration: 0.4,
  wageFlexibility: 0.4,
  unionPower: 0.35,

  // Housing
  housingElasticity: 0.7,
  maxLTV: 80,
  propertySpeculation: 0.8,

  // Health
  publicCoverage: 40,
  premiumGrowth: 5,

  // Shocks
  oilShock: 1,
  productivityGrowth: 1.5,
  confidence: 1,
};

export const PARAM_GROUPS: ParamGroup[] = [
  {
    key: 'government',
    label: 'Government policy',
    blurb: 'Taxes, spending, transfers, and how the deficit gets paid for.',
  },
  {
    key: 'centralBank',
    label: 'Central bank',
    blurb: 'Interest rates, the printing press, and the gold standard.',
  },
  {
    key: 'banking',
    label: 'Banking system',
    blurb: 'Reserves, capital, deposit insurance, and bailouts.',
  },
  {
    key: 'markets',
    label: 'Stock market',
    blurb: 'Speculation and leverage: the raw material of bubbles.',
  },
  {
    key: 'trade',
    label: 'Trade and currency',
    blurb: 'Tariffs, retaliation, openness, and the exchange rate.',
  },
  {
    key: 'labor',
    label: 'Labor and society',
    blurb: 'Wages, unions, immigration, and discrimination.',
  },
  {
    key: 'housing',
    label: 'Housing',
    blurb: 'Supply, mortgages, speculation, and homelessness.',
  },
  {
    key: 'health',
    label: 'Health and insurance',
    blurb: 'Who is covered, and what happens to the uninsured.',
  },
  {
    key: 'shocks',
    label: 'Shocks',
    blurb: 'Oil, productivity, and animal spirits.',
  },
];

export const PARAM_DEFS: ParamDef[] = [
  // Government
  {
    kind: 'slider', key: 'taxRate', group: 'government', label: 'Household tax rate',
    min: 5, max: 60, step: 1, format: 'percent',
    note: 'Higher taxes fund spending and cool demand, but drain household budgets. Cutting them without cutting spending opens a deficit.',
  },
  {
    kind: 'slider', key: 'corporateTax', group: 'government', label: 'Corporate tax rate',
    min: 0, max: 60, step: 1, format: 'percent',
    note: 'Taxes on profits. Raising it collects revenue but squeezes earnings, investment, and stock prices.',
  },
  {
    kind: 'slider', key: 'wealthTax', group: 'government', label: 'Wealth tax',
    min: 0, max: 6, step: 0.5, format: 'percent',
    note: 'An annual levy on top-quintile wealth. Directly compresses inequality; collects less than it promises.',
  },
  {
    kind: 'slider', key: 'govSpending', group: 'government', label: 'Government spending',
    min: 5, max: 60, step: 1, format: 'percent',
    note: 'Core spending as a share of GDP. Stimulates demand now, adds to the debt if unfunded.',
  },
  {
    kind: 'slider', key: 'educationSpend', group: 'government', label: 'Education spending',
    min: 0, max: 12, step: 0.5, format: 'percent',
    note: 'The slowest, most reliable dial in the room. Feeds productivity and social mobility with a long lag.',
  },
  {
    kind: 'slider', key: 'publicHealthSpend', group: 'government', label: 'Public health spending',
    min: 0, max: 14, step: 0.5, format: 'percent',
    note: 'Expands public insurance coverage and shields households from medical bankruptcy.',
  },
  {
    kind: 'slider', key: 'safetyNet', group: 'government', label: 'Safety net generosity',
    min: 0, max: 10, step: 0.5, format: 'number',
    note: 'Unemployment benefits and housing assistance. Softens recessions and homelessness; costs more when things go wrong.',
  },
  {
    kind: 'slider', key: 'minWageLevel', group: 'government', label: 'Minimum wage (share of median)',
    min: 0, max: 0.9, step: 0.05, format: 'ratio',
    note: 'Lifts low-end pay. Push it far above productivity and hiring at the bottom slows.',
  },
  {
    kind: 'slider', key: 'deficitMonetization', group: 'government', label: 'Deficit monetization',
    min: 0, max: 100, step: 5, format: 'percent',
    note: 'The share of the deficit paid for with newly printed money instead of borrowing. The classic first step toward hyperinflation.',
  },
  {
    kind: 'slider', key: 'bondVigilance', group: 'government', label: 'Bond market vigilance',
    min: 0, max: 3, step: 0.1, format: 'multiplier',
    note: 'How hard investors punish high debt with higher yields. Turn it up and a debt spiral arrives sooner.',
  },

  // Central bank
  {
    kind: 'toggle', key: 'cbAuto', group: 'centralBank', label: 'Policy rate control',
    onLabel: 'Automatic (Taylor rule)', offLabel: 'Manual',
    note: 'Automatic mode raises rates when inflation runs above target and cuts them in a slump, like a modern independent central bank.',
  },
  {
    kind: 'slider', key: 'policyRateManual', group: 'centralBank', label: 'Manual policy rate',
    min: 0, max: 30, step: 0.25, format: 'percent',
    note: 'Only applies with the Taylor rule off. Set it yourself and find out why central banking is hard.',
  },
  {
    kind: 'slider', key: 'inflationTarget', group: 'centralBank', label: 'Inflation target',
    min: 0, max: 10, step: 0.5, format: 'percent',
    note: 'The anchor for expectations. Most real central banks pick 2 percent.',
  },
  {
    kind: 'slider', key: 'taylorAggressiveness', group: 'centralBank', label: 'Response aggressiveness',
    min: 0, max: 4, step: 0.1, format: 'multiplier',
    note: 'How violently the automatic rule reacts to inflation misses. Below 1, inflation can feed on itself.',
  },
  {
    kind: 'slider', key: 'moneyPrinting', group: 'centralBank', label: 'Money printing',
    min: 0, max: 300, step: 5, format: 'percent',
    note: 'Extra annual money supply growth beyond what the economy needs. Small doses are stimulus. Large doses are Weimar.',
  },
  {
    kind: 'slider', key: 'qe', group: 'centralBank', label: 'Quantitative easing',
    min: 0, max: 10, step: 0.5, format: 'number',
    note: 'Central bank bond purchases. Suppresses long-term yields and inflates asset prices.',
  },
  {
    kind: 'toggle', key: 'goldStandard', group: 'centralBank', label: 'Monetary regime',
    onLabel: 'Gold standard', offLabel: 'Fiat currency',
    note: 'On gold, money is pinned to reserves and the exchange rate is fixed. Inflation gets hard; so does fighting recessions.',
  },
  {
    kind: 'slider', key: 'goldCoverRatio', group: 'centralBank', label: 'Gold cover ratio',
    min: 20, max: 100, step: 5, format: 'percent',
    note: 'How much gold must back each unit of currency. Higher cover means tighter money and deflationary pressure.',
  },

  // Banking
  {
    kind: 'slider', key: 'reserveRequirement', group: 'banking', label: 'Reserve requirement',
    min: 0, max: 40, step: 1, format: 'percent',
    note: 'Cash banks must hold against deposits. Higher reserves mean safer banks and less credit.',
  },
  {
    kind: 'slider', key: 'capitalRequirement', group: 'banking', label: 'Capital requirement',
    min: 2, max: 25, step: 0.5, format: 'percent',
    note: 'The equity cushion between bad loans and bank failure. Thin cushions make crises contagious.',
  },
  {
    kind: 'toggle', key: 'depositInsurance', group: 'banking', label: 'Deposit insurance',
    onLabel: 'Insured', offLabel: 'Uninsured',
    note: 'Guarantees deposits so a failing bank does not trigger a run. The United States had none in 1929.',
  },
  {
    kind: 'toggle', key: 'bailoutPolicy', group: 'banking', label: 'Bank bailouts',
    onLabel: 'Rescue failing banks', offLabel: 'Let them fail',
    note: 'Rescues stop the panic and protect credit, at taxpayer cost. Every rescue teaches banks to gamble bigger: moral hazard.',
  },
  {
    kind: 'slider', key: 'lendingAppetite', group: 'banking', label: 'Bank risk appetite',
    min: 0, max: 2, step: 0.1, format: 'multiplier',
    note: 'How eagerly banks lend. Feeds booms, bubbles, and eventually loan losses.',
  },

  // Markets
  {
    kind: 'slider', key: 'speculation', group: 'markets', label: 'Speculative intensity',
    min: 0, max: 2, step: 0.1, format: 'multiplier',
    note: 'How much investors chase momentum instead of earnings. The fuel of every bubble.',
  },
  {
    kind: 'slider', key: 'marginLeverage', group: 'markets', label: 'Margin leverage',
    min: 0, max: 3, step: 0.1, format: 'multiplier',
    note: 'Borrowed money in the market. Amplifies the ride up and turns corrections into crashes. 1929 ran near the top of this dial.',
  },

  // Trade
  {
    kind: 'slider', key: 'tariffRate', group: 'trade', label: 'Tariff rate',
    min: 0, max: 70, step: 1, format: 'percent',
    note: 'A tax on imports. Protects some producers, raises consumer prices, and invites retaliation.',
  },
  {
    kind: 'slider', key: 'retaliation', group: 'trade', label: 'Foreign retaliation',
    min: 0, max: 100, step: 5, format: 'percent',
    note: 'How much of your tariff trading partners mirror back onto your exports.',
  },
  {
    kind: 'slider', key: 'tradeOpenness', group: 'trade', label: 'Trade openness',
    min: 0, max: 2, step: 0.1, format: 'multiplier',
    note: 'Zero is autarky. Two is hyper-globalization. Openness raises efficiency and exposure at the same time.',
  },
  {
    kind: 'slider', key: 'foreignDemand', group: 'trade', label: 'World demand',
    min: 0.5, max: 1.5, step: 0.05, format: 'multiplier',
    note: 'How hungry the rest of the world is for your exports. Not your dial in real life, which is the point.',
  },

  // Labor and society
  {
    kind: 'slider', key: 'discrimination', group: 'labor', label: 'Labor market discrimination',
    min: 0, max: 1, step: 0.05, format: 'ratio',
    note: 'Excludes part of the population from jobs and pay. It shows up as a persistent unemployment gap, lower mobility, and wasted output.',
  },
  {
    kind: 'slider', key: 'immigration', group: 'labor', label: 'Net immigration',
    min: -1, max: 3, step: 0.1, format: 'percent',
    note: 'Net migration as a share of population per year. Grows the labor force and long-run output.',
  },
  {
    kind: 'slider', key: 'wageFlexibility', group: 'labor', label: 'Wage flexibility',
    min: 0, max: 1, step: 0.05, format: 'ratio',
    note: 'How fast wages adjust to conditions. Rigid wages mean longer unemployment; perfectly flexible wages mean deeper pay cuts in slumps.',
  },
  {
    kind: 'slider', key: 'unionPower', group: 'labor', label: 'Union power',
    min: 0, max: 1, step: 0.05, format: 'ratio',
    note: 'Bargaining power over wages. Lifts the wage share and can entrench wage-price spirals when inflation runs hot.',
  },

  // Housing
  {
    kind: 'slider', key: 'housingElasticity', group: 'housing', label: 'Housing supply response',
    min: 0, max: 2, step: 0.1, format: 'multiplier',
    note: 'How fast builders answer rising prices. Strict zoning sits near zero, and prices do the adjusting instead.',
  },
  {
    kind: 'slider', key: 'maxLTV', group: 'housing', label: 'Maximum mortgage LTV',
    min: 50, max: 110, step: 5, format: 'percent',
    note: 'The biggest loan allowed against a home. Above 100 means lending more than the house is worth. That happened in 2006.',
  },
  {
    kind: 'slider', key: 'propertySpeculation', group: 'housing', label: 'Property speculation',
    min: 0, max: 2, step: 0.1, format: 'multiplier',
    note: 'Investors buying homes for price appreciation rather than shelter. Momentum in, fragility out.',
  },

  // Health
  {
    kind: 'slider', key: 'publicCoverage', group: 'health', label: 'Public insurance coverage',
    min: 0, max: 100, step: 5, format: 'percent',
    note: 'The share of citizens covered by public insurance regardless of employment. The rest depend on employer plans.',
  },
  {
    kind: 'slider', key: 'premiumGrowth', group: 'health', label: 'Premium inflation',
    min: 0, max: 15, step: 0.5, format: 'percent',
    note: 'How fast private premiums grow. Outpace wages for long enough and coverage quietly erodes.',
  },

  // Shocks
  {
    kind: 'slider', key: 'oilShock', group: 'shocks', label: 'Oil price shock',
    min: 0.5, max: 4, step: 0.1, format: 'multiplier',
    note: 'World oil prices relative to normal. 1973 quadrupled overnight; set it to 4 and watch stagflation assemble itself.',
  },
  {
    kind: 'slider', key: 'productivityGrowth', group: 'shocks', label: 'Productivity growth',
    min: -2, max: 5, step: 0.1, format: 'percent',
    note: 'Output per worker per year. The only free lunch in economics.',
  },
  {
    kind: 'slider', key: 'confidence', group: 'shocks', label: 'Animal spirits',
    min: 0.5, max: 1.5, step: 0.05, format: 'multiplier',
    note: 'Keynes called it animal spirits: the mood of households and firms. Depressions are partly a state of mind.',
  },
];

export function defsForGroup(group: ParamGroup['key']): ParamDef[] {
  return PARAM_DEFS.filter(def => def.group === group);
}
