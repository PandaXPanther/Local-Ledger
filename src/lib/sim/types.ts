/**
 * Type definitions for the LocalLedger economy simulator ("the Machine").
 *
 * The model is a deterministic, seeded, quarterly macroeconomic simulation of a
 * synthetic ten-million-citizen nation. It is an educational toy, not a forecast:
 * every relationship is a simplified, documented approximation of a mainstream
 * macro mechanism (Taylor rule, Okun's law, Phillips curve, quantity theory,
 * balance-sheet banking, purchasing power parity).
 */

export interface SimParams {
  // Government policy
  taxRate: number;              // effective household tax take, % of income
  corporateTax: number;         // statutory corporate rate, %
  wealthTax: number;            // annual tax on top-quintile wealth, %
  govSpending: number;          // core spending ex-interest, % of GDP
  educationSpend: number;       // % of GDP
  publicHealthSpend: number;    // % of GDP
  safetyNet: number;            // transfer generosity index, 0-10
  minWageLevel: number;         // minimum wage as share of median wage, 0-0.9
  deficitMonetization: number;  // % of deficit financed by money creation
  bondVigilance: number;        // how sharply bond markets punish debt, 0-3

  // Central bank
  cbAuto: boolean;              // true = Taylor rule, false = manual rate
  policyRateManual: number;     // % annual, used when cbAuto is false
  inflationTarget: number;      // % annual
  taylorAggressiveness: number; // response to inflation gap, 0-4
  moneyPrinting: number;        // extra annual money growth, %
  qe: number;                   // asset purchase intensity, 0-10
  goldStandard: boolean;        // money supply pinned to gold reserves
  goldCoverRatio: number;       // required gold backing of money, %

  // Banking
  reserveRequirement: number;   // % of deposits
  capitalRequirement: number;   // minimum capital ratio, %
  depositInsurance: boolean;
  bailoutPolicy: boolean;       // government rescues failing banks
  lendingAppetite: number;      // bank risk appetite, 0-2

  // Markets
  speculation: number;          // investor speculative intensity, 0-2
  marginLeverage: number;       // borrowed money in the stock market, 0-3

  // Trade
  tariffRate: number;           // % on imports
  retaliation: number;          // trading partners' response, % of our tariff
  tradeOpenness: number;        // 0 = autarky, 2 = hyper-globalized
  foreignDemand: number;        // world demand multiplier, 0.5-1.5

  // Labor and society
  discrimination: number;       // labor market discrimination index, 0-1
  immigration: number;          // net migration, % of population per year
  wageFlexibility: number;      // how fast wages adjust, 0-1
  unionPower: number;           // wage bargaining power, 0-1

  // Housing
  housingElasticity: number;    // how fast supply responds to prices, 0-2
  maxLTV: number;               // maximum mortgage loan-to-value, %
  propertySpeculation: number;  // investor activity in housing, 0-2

  // Health and insurance
  publicCoverage: number;       // % of population publicly insured
  premiumGrowth: number;        // private premium inflation, % per year

  // Shocks
  oilShock: number;             // world oil price multiplier, 0.5-4
  productivityGrowth: number;   // % per year
  confidence: number;           // household and firm sentiment, 0.5-1.5
}

export type NumericParamKey = {
  [K in keyof SimParams]: SimParams[K] extends number ? K : never;
}[keyof SimParams];

export type BooleanParamKey = {
  [K in keyof SimParams]: SimParams[K] extends boolean ? K : never;
}[keyof SimParams];

export type ParamGroupKey =
  | 'government'
  | 'centralBank'
  | 'banking'
  | 'markets'
  | 'trade'
  | 'labor'
  | 'housing'
  | 'health'
  | 'shocks';

export interface ParamGroup {
  key: ParamGroupKey;
  label: string;
  blurb: string;
}

export type SliderFormat = 'percent' | 'number' | 'ratio' | 'multiplier';

export interface SliderDef {
  kind: 'slider';
  key: NumericParamKey;
  group: ParamGroupKey;
  label: string;
  min: number;
  max: number;
  step: number;
  format: SliderFormat;
  note: string;
}

export interface ToggleDef {
  kind: 'toggle';
  key: BooleanParamKey;
  group: ParamGroupKey;
  label: string;
  onLabel: string;
  offLabel: string;
  note: string;
}

export type ParamDef = SliderDef | ToggleDef;

export type EventSeverity = 'info' | 'good' | 'warn' | 'crisis';

export interface SimEvent {
  quarter: number;
  severity: EventSeverity;
  text: string;
}

export interface SimState {
  quarter: number;

  // Output and prices
  gdp: number;                  // real GDP, $B
  potentialGdp: number;         // $B
  gdpGrowth: number;            // annualized real growth, %
  priceLevel: number;           // index, 100 at start
  inflation: number;            // annualized, %
  inflationExpectations: number;
  hyperinflation: boolean;

  // Labor
  unemployment: number;         // %
  minorityUnemployment: number; // %
  wageIndex: number;            // nominal, 100 at start
  realWageIndex: number;

  // Money and rates
  moneySupply: number;          // $B
  policyRate: number;           // % annual
  bondYield: number;            // % annual, 10y government
  mortgageRate: number;         // % annual
  goldReserves: number;         // $B at par

  // Government
  govDebt: number;              // nominal $B
  debtToGdp: number;            // %
  deficitToGdp: number;         // %, annualized
  defaulted: boolean;

  // Banking
  bankCapitalRatio: number;     // %
  creditAvailability: number;   // 0-1.6, 1 = normal
  bankFailures: number;         // cumulative
  moralHazard: number;          // 0-1.5, risk appetite from past rescues

  // Markets
  stockIndex: number;           // 100 at start
  stockFairValue: number;
  bubbleHeat: number;           // 0-1
  stockPeak: number;
  crashCount: number;

  // Housing
  housePriceIndex: number;      // 100 at start
  rentIndex: number;
  housingAffordability: number; // price index / wage index, 1 at start
  homelessness: number;         // per 10,000 residents
  housePeak: number;

  // External
  fxRate: number;               // index, 100 = starting parity; higher = stronger
  exports: number;              // $B per year
  imports: number;              // $B per year
  tradeBalance: number;         // % of GDP

  // Commodities
  oilPrice: number;             // index, 100 at start
  goldPrice: number;            // index, 100 at start

  // Society
  gini: number;                 // 0-1
  socialMobility: number;       // 0-100
  happiness: number;            // 0-100
  healthCoverage: number;       // % of population insured
  medicalBankruptcies: number;  // per 10,000 per year

  // Internals (carried between steps, also useful for charts)
  sentimentMomentum: number;
  recessionQuarters: number;
  inRecession: boolean;
  crisisCooldown: number;
  rngState: number;
}

/** One recorded point per quarter, kept small for chart performance. */
export interface SeriesPoint {
  q: number;
  label: string;                // e.g. "Y3Q2"
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  minorityUnemployment: number;
  policyRate: number;
  bondYield: number;
  stockIndex: number;
  housePriceIndex: number;
  homelessness: number;
  debtToGdp: number;
  happiness: number;
  gini: number;
  socialMobility: number;
  fxRate: number;
  tradeBalance: number;
  moneySupply: number;
  healthCoverage: number;
  priceLevel: number;
}

export interface StepResult {
  state: SimState;
  events: SimEvent[];
}

/** Starting-condition overrides for scenarios that begin mid-story. */
export interface PresetInit {
  debtToGdp?: number;
  unemployment?: number;
  inflation?: number;
}

export interface Preset {
  id: string;
  name: string;
  era: string;                  // e.g. "Germany, 1921-1923"
  tagline: string;
  description: string;
  watchFor: string;
  overrides: Partial<SimParams>;
  init?: PresetInit;
}
