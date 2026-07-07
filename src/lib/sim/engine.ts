import type {
  PresetInit,
  SeriesPoint,
  SimEvent,
  SimParams,
  SimState,
  StepResult,
} from './types';

/**
 * The economy simulator: a deterministic quarterly macro model of a synthetic
 * ten-million-citizen nation.
 *
 * Design rules:
 * - Pure functions only. Same params + same seed = same history, always.
 * - Every state variable is clamped; the model can collapse but never NaN.
 * - Each mechanism is a documented simplification of a mainstream macro
 *   relationship. The point is teaching direction and interaction, not forecasting.
 */

const START_GDP = 600;          // $B real
const START_MONEY = 480;        // $B
const START_DEBT_TO_GDP = 62;   // %
const NATURAL_RATE_BASE = 4.4;  // % unemployment
const NEUTRAL_REAL_RATE = 1.5;  // %
const EQUITY_PREMIUM = 4.5;     // %
const MAX_QUARTERS = 400;

function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Deterministic PRNG (mulberry32). Returns [0, 1). */
function nextRandom(state: number): { value: number; state: number } {
  const a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: a };
}

export function quarterLabel(quarter: number): string {
  const index = Math.max(1, quarter) - 1;
  const year = Math.floor(index / 4) + 1;
  const q = (index % 4) + 1;
  return `Y${year}Q${q}`;
}

export function createInitialState(params: SimParams, seed = 16, init?: PresetInit): SimState {
  const gdp = START_GDP;
  const debtToGdp = init?.debtToGdp ?? START_DEBT_TO_GDP;
  const unemployment = init?.unemployment ?? 4.8;
  const inflation = init?.inflation ?? 2;
  return {
    quarter: 0,

    gdp,
    potentialGdp: gdp,
    gdpGrowth: 2.2,
    priceLevel: 100,
    inflation,
    inflationExpectations: inflation,
    hyperinflation: false,

    unemployment,
    minorityUnemployment: unemployment * (1 + 1.8 * params.discrimination),
    wageIndex: 100,
    realWageIndex: 100,

    moneySupply: START_MONEY,
    policyRate: 4,
    bondYield: 4.2,
    mortgageRate: 6,
    goldReserves: (START_MONEY * params.goldCoverRatio) / 100,

    govDebt: (gdp * debtToGdp) / 100,
    debtToGdp,
    deficitToGdp: 3,
    defaulted: false,

    bankCapitalRatio: Math.max(params.capitalRequirement + 2.5, 10),
    creditAvailability: 1,
    bankFailures: 0,
    moralHazard: 0,

    stockIndex: 100,
    stockFairValue: 100,
    bubbleHeat: 0.15,
    stockPeak: 100,
    crashCount: 0,

    housePriceIndex: 100,
    rentIndex: 100,
    housingAffordability: 1,
    homelessness: 20,
    housePeak: 100,

    fxRate: 100,
    exports: gdp * 0.12 * params.tradeOpenness,
    imports: gdp * 0.13 * params.tradeOpenness,
    tradeBalance: -1,

    oilPrice: 100,
    goldPrice: 100,

    gini: 0.42,
    socialMobility: 55,
    happiness: 68,
    healthCoverage: 90,
    medicalBankruptcies: 6,

    sentimentMomentum: 0,
    recessionQuarters: 0,
    inRecession: false,
    crisisCooldown: 0,
    rngState: seed | 0,
  };
}

export function stepQuarter(prev: SimState, params: SimParams): StepResult {
  const s: SimState = { ...prev };
  const events: SimEvent[] = [];
  s.quarter = prev.quarter + 1;
  if (s.crisisCooldown > 0) s.crisisCooldown -= 1;

  // Deterministic noise draws (fixed count per step keeps seeds comparable).
  const draws: number[] = [];
  let rng = prev.rngState;
  for (let i = 0; i < 6; i += 1) {
    const r = nextRandom(rng);
    rng = r.state;
    draws.push(r.value);
  }
  s.rngState = rng;
  const noise = (index: number, scale: number) => (draws[index] - 0.5) * 2 * scale;

  // ------------------------------------------------------------------
  // 1. Potential output: productivity + labor force + education, minus the
  //    efficiency cost of excluding workers (discrimination) and poor health.
  // ------------------------------------------------------------------
  const laborForceGrowth = 0.3 + params.immigration * 0.6;
  const educationBoost = (params.educationSpend - 5) * 0.08;
  const discriminationDrag = params.discrimination * 0.5;
  const healthDrag = Math.max(0, 20 - Math.min(20, prev.healthCoverage / 5)) * 0.01;
  const potentialGrowthAnnual =
    params.productivityGrowth + laborForceGrowth * 0.7 + educationBoost - discriminationDrag - healthDrag;
  s.potentialGdp = clamp(prev.potentialGdp * (1 + potentialGrowthAnnual / 400), 50, 1e6);

  // ------------------------------------------------------------------
  // 2. Central bank policy rate.
  // ------------------------------------------------------------------
  const outputGapPct = ((prev.gdp - prev.potentialGdp) / prev.potentialGdp) * 100;
  if (params.goldStandard) {
    // On gold the rate defends reserves, not the domestic economy.
    const reserveStress = Math.max(0, (params.goldCoverRatio / 100) - prev.goldReserves / Math.max(prev.moneySupply, 1));
    const externalStress = Math.max(0, -prev.tradeBalance) * 0.3;
    s.policyRate = clamp(3 + reserveStress * 40 + externalStress, 0.5, 30);
  } else if (params.cbAuto) {
    const taylor =
      NEUTRAL_REAL_RATE +
      prev.inflation +
      params.taylorAggressiveness * (prev.inflation - params.inflationTarget) +
      0.5 * outputGapPct;
    s.policyRate = clamp(0.85 * prev.policyRate + 0.15 * taylor, 0, 60);
  } else {
    s.policyRate = clamp(params.policyRateManual, 0, 60);
  }

  // ------------------------------------------------------------------
  // 3. Money supply. Fiat money accommodates nominal growth plus whatever the
  //    printing press and monetized deficits add. Gold money is capped by reserves.
  // ------------------------------------------------------------------
  const nominalGrowthAnnual = prev.gdpGrowth + prev.inflation;
  const monetizedDeficit =
    (params.deficitMonetization / 100) * Math.max(0, prev.deficitToGdp) * (prev.gdp * prev.priceLevel / 100) / 100;
  let moneyGrowthQuarterly =
    (clamp(nominalGrowthAnnual, -20, 400) + params.moneyPrinting + params.qe * 0.8) / 400 +
    monetizedDeficit / Math.max(prev.moneySupply, 1) / 4;
  if (params.goldStandard) {
    const goldCap = (prev.goldReserves * 100) / params.goldCoverRatio;
    const headroom = (goldCap - prev.moneySupply) / Math.max(prev.moneySupply, 1);
    moneyGrowthQuarterly = clamp(Math.min(moneyGrowthQuarterly, headroom), -0.02, 0.005);
    // Reserves drift with the trade balance (gold flows).
    s.goldReserves = clamp(prev.goldReserves * (1 + prev.tradeBalance / 400), 1, 1e6);
  }
  s.moneySupply = clamp(prev.moneySupply * (1 + moneyGrowthQuarterly), 10, 1e9);
  const moneyGrowthAnnual = moneyGrowthQuarterly * 400;

  // ------------------------------------------------------------------
  // 4. Bond, mortgage rates. Yields price policy, expected inflation, and
  //    default risk; QE leans against them.
  // ------------------------------------------------------------------
  const debtStress = Math.max(0, prev.debtToGdp - 90);
  const riskPremium = params.bondVigilance * Math.pow(debtStress / 10, 1.3) * 0.35 + (prev.defaulted ? 4 : 0);
  s.bondYield = clamp(
    0.55 * s.policyRate + 0.6 * prev.inflationExpectations + 1 + riskPremium - params.qe * 0.35,
    0.1,
    80,
  );
  const creditStress = prev.creditAvailability < 0.8 ? (0.8 - prev.creditAvailability) * 6 : 0;
  s.mortgageRate = clamp(s.bondYield + 1.6 + creditStress, 0.5, 90);

  // ------------------------------------------------------------------
  // 5. Credit availability from bank balance sheets.
  // ------------------------------------------------------------------
  const capitalCushion = prev.bankCapitalRatio - params.capitalRequirement;
  const appetite = params.lendingAppetite * (1 + 0.5 * prev.moralHazard);
  s.creditAvailability = clamp(
    0.6 + capitalCushion * 0.05 + appetite * 0.3 - params.reserveRequirement * 0.012,
    0.05,
    1.6,
  );

  // ------------------------------------------------------------------
  // 6. Aggregate demand. Deviations from a neutral setting sum into a demand
  //    pressure term that pulls GDP around potential.
  // ------------------------------------------------------------------
  const realRate = s.policyRate - prev.inflationExpectations;
  const wealthEffect =
    ((prev.stockIndex / Math.max(prev.stockPeak, 1)) - 0.9) * 1.2 +
    ((prev.housePriceIndex / Math.max(prev.housePeak, 1)) - 0.9) * 1.6;
  const fiscalImpulse = (params.govSpending - 22) * 0.09 + (26 - params.taxRate) * 0.05 + params.safetyNet * 0.02;
  const inflationDrag = prev.inflation > 8 ? (prev.inflation - 8) * 0.06 : 0;
  const deflationDrag = prev.inflation < -1 ? (-1 - prev.inflation) * 0.25 : 0;
  const tradeImpulse = prev.tradeBalance * 0.12;
  const confidenceImpulse = (params.confidence - 1) * 3 + prev.sentimentMomentum * 0.4;
  const oilDrag = (prev.oilPrice / 100 - 1) * 0.9;
  const demandPressure =
    -0.55 * (realRate - NEUTRAL_REAL_RATE) * 0.4 +
    (s.creditAvailability - 1) * 1.6 +
    fiscalImpulse +
    wealthEffect +
    tradeImpulse +
    confidenceImpulse -
    inflationDrag -
    deflationDrag -
    oilDrag -
    0.35 * outputGapPct;

  const growthAnnual = clamp(
    potentialGrowthAnnual + demandPressure + noise(0, 0.5),
    prev.crisisCooldown > 0 ? -18 : -12,
    12,
  );
  s.gdp = clamp(prev.gdp * (1 + growthAnnual / 400), 30, 1e6);
  s.gdpGrowth = growthAnnual;

  // Recession bookkeeping (two consecutive contracting quarters).
  if (growthAnnual < 0) {
    s.recessionQuarters = prev.recessionQuarters + 1;
  } else {
    s.recessionQuarters = 0;
  }
  const wasInRecession = prev.inRecession;
  s.inRecession = s.recessionQuarters >= 2 || (wasInRecession && growthAnnual < 0.5);
  if (s.inRecession && !wasInRecession) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'Recession begins: output has contracted for two straight quarters.' });
  }
  if (!s.inRecession && wasInRecession) {
    events.push({ quarter: s.quarter, severity: 'good', text: 'Recession ends. Output is growing again.' });
  }

  // ------------------------------------------------------------------
  // 7. Labor market: Okun's law plus structural frictions.
  // ------------------------------------------------------------------
  const minWagePush = Math.max(0, params.minWageLevel - 0.55) * 8;
  const rigidity = (1 - params.wageFlexibility) * 0.8;
  const naturalRate = clamp(NATURAL_RATE_BASE + minWagePush + rigidity, 2.5, 15);
  const okun = -0.45 * (growthAnnual - potentialGrowthAnnual) / 4;
  const meanReversion = 0.06 * (naturalRate - prev.unemployment);
  s.unemployment = clamp(prev.unemployment + okun + meanReversion + noise(1, 0.08), 2, 40);
  s.minorityUnemployment = clamp(s.unemployment * (1 + 1.8 * params.discrimination) + params.discrimination * 1.5, 2, 60);

  // Wages: Phillips curve with union bargaining and minimum wage floor.
  const wageGrowthAnnual =
    prev.inflationExpectations * (0.5 + params.unionPower * 0.5) +
    (naturalRate - s.unemployment) * (0.4 + params.wageFlexibility * 0.5) +
    params.productivityGrowth * 0.6 +
    params.minWageLevel * 0.8;
  s.wageIndex = clamp(prev.wageIndex * (1 + wageGrowthAnnual / 400), 1, 1e9);

  // ------------------------------------------------------------------
  // 8. Inflation: expectations + demand gap + money impulse + cost push.
  // ------------------------------------------------------------------
  const newGapPct = ((s.gdp - s.potentialGdp) / s.potentialGdp) * 100;
  const excessMoney = moneyGrowthAnnual - clamp(nominalGrowthAnnual, -10, 15);
  const unanchored = prev.inflation > 20 || prev.hyperinflation;
  const passThrough = unanchored ? 0.9 : 0.35;
  // Excess money is inflationary; scarce money is deflationary, and the squeeze
  // is far harsher when the gold standard forbids accommodation.
  const moneyImpulse =
    excessMoney > 0
      ? excessMoney * passThrough
      : excessMoney * (params.goldStandard ? 0.3 : 0.05);
  const oilPush = (prev.oilPrice / 100 - 1) * 2.2;
  const tariffPush = params.tariffRate * 0.028 * params.tradeOpenness;
  const importPush = ((100 - s.fxRate) / 100) * 1.5 * params.tradeOpenness;
  // While expectations stay anchored, central bank credibility pulls inflation
  // toward the announced target; once unanchored, the anchor is gone.
  const credibilityAnchor = unanchored ? 0 : 0.23 * params.inflationTarget;
  const inflationRaw =
    0.62 * prev.inflationExpectations +
    0.15 * prev.inflation +
    credibilityAnchor +
    0.55 * newGapPct +
    moneyImpulse +
    oilPush +
    tariffPush +
    importPush -
    params.productivityGrowth * 0.1 +
    noise(2, 0.3);
  s.inflation = clamp(inflationRaw, -15, 10000);

  // Expectations: adaptive; they unanchor once inflation runs away.
  const anchorSpeed = unanchored ? 0.85 : 0.22;
  s.inflationExpectations = clamp(
    prev.inflationExpectations + anchorSpeed * (s.inflation - prev.inflationExpectations),
    -10,
    10000,
  );
  if (!prev.hyperinflation && s.inflation > 100) {
    s.hyperinflation = true;
    events.push({
      quarter: s.quarter,
      severity: 'crisis',
      text: 'Hyperinflation. Prices are more than doubling every year and the currency is failing as a store of value.',
    });
  }
  if (prev.hyperinflation && s.inflation < 15) {
    s.hyperinflation = false;
    events.push({ quarter: s.quarter, severity: 'good', text: 'Stabilization: inflation has fallen out of the hyperinflationary regime.' });
  }
  s.priceLevel = clamp(prev.priceLevel * (1 + s.inflation / 400), 0.1, 1e12);
  s.realWageIndex = clamp((s.wageIndex / s.priceLevel) * 100, 0.1, 1e9);
  if (s.inflation < -3 && prev.inflation >= -3) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'Deflation has set in. Debts are getting heavier in real terms and spending is being deferred.' });
  }

  // ------------------------------------------------------------------
  // 9. Government budget in nominal terms.
  // ------------------------------------------------------------------
  const nominalGdp = (s.gdp * s.priceLevel) / 100;
  const tariffRevenue = (params.tariffRate / 100) * (prev.imports * s.priceLevel / 100) * 0.9;
  const revenue =
    nominalGdp * ((params.taxRate * 0.62 + params.corporateTax * 0.18 + params.wealthTax * 0.35) / 100) +
    tariffRevenue;
  const cyclicalSpend = params.safetyNet * 0.14 * Math.max(0, s.unemployment - 4) * nominalGdp / 100;
  const programSpend =
    nominalGdp * ((params.govSpending + params.educationSpend + params.publicHealthSpend) / 100) * 0.62;
  const interestSpend = (prev.govDebt * s.bondYield) / 100;
  const spending = programSpend + cyclicalSpend + interestSpend;
  const deficit = spending - revenue;
  const borrowed = deficit * (1 - params.deficitMonetization / 100);
  s.govDebt = clamp(prev.govDebt + borrowed / 4, 0, 1e12);
  s.debtToGdp = clamp((s.govDebt / Math.max(nominalGdp, 1)) * 100, 0, 100000);
  s.deficitToGdp = clamp((deficit / Math.max(nominalGdp, 1)) * 100, -50, 200);

  // Sovereign debt crisis: high debt + punishing yields + a vigilant market.
  if (
    !prev.defaulted &&
    s.debtToGdp > 130 &&
    s.bondYield > 11 &&
    params.deficitMonetization < 50 &&
    prev.crisisCooldown === 0 &&
    draws[3] < clamp((s.debtToGdp - 130) / 300 + (s.bondYield - 11) / 60, 0, 0.6)
  ) {
    s.defaulted = true;
    s.crisisCooldown = 8;
    s.govDebt *= 0.65;
    s.bankCapitalRatio = clamp(prev.bankCapitalRatio - 5, -10, 40);
    s.fxRate = clamp(s.fxRate * 0.82, 5, 400);
    s.sentimentMomentum -= 2;
    events.push({
      quarter: s.quarter,
      severity: 'crisis',
      text: 'Sovereign default. The government restructures its bonds with a 35 percent haircut. Banks holding that debt take heavy losses and the currency slides.',
    });
  } else if (s.debtToGdp > 115 && prev.debtToGdp <= 115) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'Debt passes 115 percent of GDP. Bond investors are starting to demand a risk premium.' });
  }

  // ------------------------------------------------------------------
  // 10. Stock market: fair value from earnings and discount rates, plus a
  //     momentum bubble that leverage turns into crashes.
  // ------------------------------------------------------------------
  const earningsGrowth =
    growthAnnual * 1.6 - (params.corporateTax - 21) * 0.12 - (params.wealthTax > 2 ? 0.5 : 0);
  const discount = Math.max(s.bondYield + EQUITY_PREMIUM - clamp(earningsGrowth, -10, 8), 2);
  s.stockFairValue = clamp(prev.stockFairValue * (1 + (earningsGrowth + (10 - discount) * 0.8) / 400), 1, 1e9);

  const pastReturn = (prev.stockIndex - prev.stockFairValue) / Math.max(prev.stockFairValue, 1);
  s.bubbleHeat = clamp(
    0.85 * prev.bubbleHeat +
      0.03 * params.speculation +
      0.025 * params.marginLeverage +
      0.04 * Math.max(0, s.creditAvailability - 1) +
      0.04 * Math.max(0, prev.sentimentMomentum) +
      (s.policyRate < 2 ? 0.02 : 0),
    0,
    1,
  );
  // Weak pull toward fair value; the bubble term can outrun it for years.
  const reversionReturn =
    ((s.stockFairValue - prev.stockIndex) / Math.max(prev.stockIndex, 1)) * 0.08;
  const bubbleReturn = s.bubbleHeat * (0.5 + params.speculation) * 0.025;
  let stockIndex = clamp(
    prev.stockIndex * (1 + reversionReturn + bubbleReturn + noise(4, 0.02)),
    1,
    1e9,
  );

  const overvaluation = (stockIndex - s.stockFairValue) / Math.max(s.stockFairValue, 1);
  const crashProb = clamp(
    0.005 +
      Math.pow(Math.max(0, overvaluation), 2) * 0.5 +
      s.bubbleHeat * Math.max(0, overvaluation) * 0.25 +
      (s.inRecession ? 0.05 : 0) +
      (s.policyRate - prev.policyRate > 1.5 ? 0.06 : 0),
    0,
    overvaluation > 0.8 ? 1 : 0.5,
  );
  if (draws[5] < crashProb && overvaluation > 0.15 && prev.crisisCooldown === 0) {
    const severity = clamp(0.2 + overvaluation * 0.4 + params.marginLeverage * 0.08, 0.15, 0.6);
    stockIndex *= 1 - severity;
    s.crashCount = prev.crashCount + 1;
    s.crisisCooldown = 6;
    s.sentimentMomentum = -2.5;
    // Margin calls transmit the crash into bank capital.
    s.bankCapitalRatio = clamp(prev.bankCapitalRatio - severity * params.marginLeverage * 4, -10, 40);
    events.push({
      quarter: s.quarter,
      severity: 'crisis',
      text: `Stock market crash. The index falls ${Math.round(severity * 100)} percent as leveraged positions unwind${params.marginLeverage > 1.5 ? ' and margin calls cascade through the banking system' : ''}.`,
    });
  } else if (overvaluation > 0.5 && pastReturn <= 0.5) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'The stock market is trading far above any defensible value. This is what a bubble feels like from the inside.' });
  }
  s.stockIndex = stockIndex;
  s.stockPeak = Math.max(prev.stockPeak, stockIndex);
  s.sentimentMomentum = clamp(
    0.7 * s.sentimentMomentum + 0.3 * ((stockIndex / prev.stockIndex - 1) * 20 + (params.confidence - 1) * 2),
    -4,
    4,
  );

  // ------------------------------------------------------------------
  // 11. Housing: demand vs sluggish supply, mortgages, foreclosures,
  //     affordability, homelessness.
  // ------------------------------------------------------------------
  const housingDemand =
    wageGrowthAnnual * 0.3 +
    laborForceGrowth * 0.8 -
    (s.mortgageRate - 6) * 0.8 +
    params.propertySpeculation * Math.max(0, (prev.housePriceIndex / prev.rentIndex - 1)) * 6 +
    (params.maxLTV - 80) * 0.05 +
    Math.max(0, s.creditAvailability - 1) * 3;
  const priceDeviation = prev.housePriceIndex / Math.max(prev.rentIndex, 1) - 1;
  const supplyResponse = params.housingElasticity * Math.max(0, priceDeviation) * 8;
  let houseGrowthAnnual = clamp(housingDemand - supplyResponse + s.inflation * 0.5 + noise(3, 0.6), -35, 40);

  const housingOverext = priceDeviation > 0.35 && params.maxLTV > 90;
  if (housingOverext && draws[3] > 0.55 && prev.crisisCooldown === 0) {
    houseGrowthAnnual = -22 - params.maxLTV * 0.08;
    s.crisisCooldown = 8;
    const foreclosureLoss = (params.maxLTV / 100) * 3.5;
    s.bankCapitalRatio = clamp(s.bankCapitalRatio - foreclosureLoss, -10, 40);
    s.sentimentMomentum -= 1.5;
    events.push({
      quarter: s.quarter,
      severity: 'crisis',
      text: 'The housing bubble bursts. Prices fall, high-LTV mortgages go underwater, and foreclosure losses land on bank balance sheets.',
    });
  }
  s.housePriceIndex = clamp(prev.housePriceIndex * (1 + houseGrowthAnnual / 400), 5, 1e9);
  s.housePeak = Math.max(prev.housePeak, s.housePriceIndex);
  s.rentIndex = clamp(
    prev.rentIndex * (1 + (s.inflation + Math.max(0, houseGrowthAnnual) * 0.35 - params.housingElasticity * 1.2) / 400),
    5,
    1e9,
  );
  s.housingAffordability = clamp(s.housePriceIndex / Math.max(s.wageIndex, 1), 0.1, 50);
  const rentBurden = s.rentIndex / Math.max(s.wageIndex, 1);
  s.homelessness = clamp(
    20 +
      Math.max(0, rentBurden - 1) * 160 +
      (s.unemployment - 4.5) * 2.6 +
      (prev.defaulted ? 6 : 0) -
      params.safetyNet * 3.2 -
      params.publicHealthSpend * 0.8,
    2,
    400,
  );
  if (s.homelessness > 60 && prev.homelessness <= 60) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'Homelessness crisis: rents have outrun wages and the shelter system is over capacity.' });
  }

  // ------------------------------------------------------------------
  // 12. Banking system: loan losses, failures, bailouts, moral hazard.
  // ------------------------------------------------------------------
  const loanLosses =
    Math.max(0, s.unemployment - 5.5) * 0.16 +
    Math.max(0, -houseGrowthAnnual - 5) * 0.05 +
    Math.max(0, -(stockIndex / prev.stockIndex - 1)) * params.marginLeverage * 2.5;
  const organicRebuild = s.inRecession ? 0.05 : 0.28;
  s.bankCapitalRatio = clamp(
    s.bankCapitalRatio - loanLosses + organicRebuild * (1 - appetite * 0.25),
    -10,
    40,
  );
  s.moralHazard = clamp(prev.moralHazard * 0.985, 0, 1.5);

  if (s.bankCapitalRatio < 3) {
    if (params.bailoutPolicy) {
      const cost = nominalGdp * 0.035;
      s.govDebt += cost;
      s.bankCapitalRatio = params.capitalRequirement + 1.5;
      s.moralHazard = clamp(s.moralHazard + 0.25, 0, 1.5);
      s.bankFailures = prev.bankFailures + 1;
      events.push({
        quarter: s.quarter,
        severity: 'warn',
        text: 'Bank bailout. The government recapitalizes the banking system at a cost of about 3.5 percent of GDP. Credit survives; so does the lesson that gambling gets covered.',
      });
    } else {
      s.bankFailures = prev.bankFailures + 1;
      s.creditAvailability = clamp(s.creditAvailability * 0.45, 0.05, 1.6);
      s.bankCapitalRatio = params.capitalRequirement;
      s.crisisCooldown = Math.max(s.crisisCooldown, 6);
      const runPenalty = params.depositInsurance ? 0 : 2.2;
      s.sentimentMomentum = clamp(s.sentimentMomentum - 1.5 - runPenalty * 0.5, -4, 4);
      events.push({
        quarter: s.quarter,
        severity: 'crisis',
        text: params.depositInsurance
          ? 'Bank failure. Depositors are made whole by insurance, but lending seizes while the system restructures.'
          : 'Bank failure with no deposit insurance. Savers are wiped out, a run spreads to healthy banks, and credit collapses.',
      });
    }
  }

  // ------------------------------------------------------------------
  // 13. Trade and the exchange rate.
  // ------------------------------------------------------------------
  if (params.goldStandard) {
    s.fxRate = 100;
  } else {
    const rateDiff = (s.policyRate - 3.5) * 0.4;
    const inflationDiff = (s.inflation - 2.5) * 0.5;
    const flight = (s.defaulted && !prev.defaulted ? -8 : 0) + (s.hyperinflation ? -6 : 0);
    s.fxRate = clamp(
      prev.fxRate * (1 + (rateDiff - inflationDiff + prev.tradeBalance * 0.15 + flight) / 100),
      2,
      400,
    );
  }
  const exportTariffHit = 1 - ((params.retaliation / 100) * params.tariffRate) / 100 * 0.9;
  const importTariffHit = 1 - (params.tariffRate / 100) * 0.85;
  const exportBase = s.gdp * 0.12 * params.tradeOpenness * params.foreignDemand;
  const importBase = s.gdp * 0.13 * params.tradeOpenness;
  s.exports = clamp(exportBase * Math.pow(100 / s.fxRate, 0.8) * clamp(exportTariffHit, 0.05, 1), 0, 1e9);
  s.imports = clamp(importBase * Math.pow(s.fxRate / 100, 0.6) * clamp(importTariffHit, 0.05, 1), 0, 1e9);
  s.tradeBalance = clamp(((s.exports - s.imports) / Math.max(s.gdp, 1)) * 100, -30, 30);
  if (params.tariffRate > 25 && params.retaliation > 60 && s.quarter % 8 === 4) {
    events.push({ quarter: s.quarter, severity: 'warn', text: 'Trade war grinding on: tariffs and retaliation have shrunk both exports and imports. Consumers pay the difference.' });
  }

  // ------------------------------------------------------------------
  // 14. Commodities.
  // ------------------------------------------------------------------
  s.oilPrice = clamp(
    prev.oilPrice + (100 * params.oilShock - prev.oilPrice) * 0.25 + growthAnnual * 0.3 + noise(4, 2),
    20,
    800,
  );
  const fear = (s.inRecession ? 4 : 0) + (s.hyperinflation ? 20 : 0) + (s.defaulted ? 8 : 0);
  s.goldPrice = clamp(prev.goldPrice * (1 + (s.inflation * 0.6 + fear - 1) / 400), 10, 1e9);

  // ------------------------------------------------------------------
  // 15. Health and insurance.
  // ------------------------------------------------------------------
  const premiumPressure = Math.max(0, params.premiumGrowth - wageGrowthAnnual) * 0.9;
  const employerCoverage = clamp(
    (100 - s.unemployment) * 0.62 - premiumPressure * 2.2,
    0,
    100 - params.publicCoverage * 0.9,
  );
  const publicBoost = clamp(params.publicCoverage + params.publicHealthSpend * 1.5, 0, 100);
  s.healthCoverage = clamp(publicBoost + employerCoverage * (1 - publicBoost / 130), 5, 100);
  s.medicalBankruptcies = clamp((100 - s.healthCoverage) * 0.5 + premiumPressure * 0.6, 0, 60);

  // ------------------------------------------------------------------
  // 16. Inequality, mobility.
  // ------------------------------------------------------------------
  const capitalGainsSkew = Math.max(0, stockIndex / prev.stockIndex - 1) * 0.9;
  s.gini = clamp(
    prev.gini +
      capitalGainsSkew * 0.01 +
      Math.max(0, s.unemployment - 4.5) * 0.0006 +
      params.discrimination * 0.0006 -
      (params.educationSpend - 5) * 0.0009 -
      params.wealthTax * 0.0018 -
      params.safetyNet * 0.0005 -
      (params.taxRate - 26) * 0.0002 +
      Math.max(0, params.minWageLevel - 0.3) * -0.002,
    0.2,
    0.75,
  );
  s.socialMobility = clamp(
    55 +
      (params.educationSpend - 5) * 4 -
      (s.gini - 0.42) * 130 -
      params.discrimination * 28 -
      Math.max(0, s.minorityUnemployment - s.unemployment) * 1.1 +
      params.safetyNet * 1.2 -
      Math.max(0, s.housingAffordability - 1.1) * 10,
    0,
    100,
  );

  // ------------------------------------------------------------------
  // 17. Happiness index: jobs, stable prices, real income growth, fairness,
  //     housing, health, and not living through a crisis.
  // ------------------------------------------------------------------
  const realIncomeGrowth = wageGrowthAnnual - s.inflation;
  const crisisPenalty =
    (s.inRecession ? 8 : 0) +
    (s.hyperinflation ? 22 : 0) +
    (s.defaulted ? 10 : 0) +
    (s.crisisCooldown > 0 ? 6 : 0);
  const happinessRaw =
    0.22 * clamp(100 - s.unemployment * 3.4, 0, 100) +
    0.15 * clamp(100 - Math.abs(s.inflation - 2) * 3.5, 0, 100) +
    0.14 * clamp(52 + realIncomeGrowth * 7, 0, 100) +
    0.12 * clamp(100 - (s.gini - 0.25) * 170, 0, 100) +
    0.13 * clamp(100 - Math.max(0, s.housingAffordability - 0.95) * 55 - Math.max(0, s.homelessness - 20) * 0.35, 0, 100) +
    0.14 * clamp(s.healthCoverage, 0, 100) +
    0.10 * clamp(100 - crisisPenalty * 4, 0, 100);
  s.happiness = clamp(0.75 * prev.happiness + 0.25 * happinessRaw, 0, 100);

  if (s.unemployment < 4 && s.inflation > 0 && s.inflation < 4 && s.happiness > 74 && s.quarter % 12 === 6) {
    events.push({ quarter: s.quarter, severity: 'good', text: 'Full employment with stable prices. Enjoy it; in this simulator, as in history, it rarely lasts.' });
  }

  return { state: s, events };
}

export interface RunResult {
  finalState: SimState;
  series: SeriesPoint[];
  events: SimEvent[];
}

export function toSeriesPoint(state: SimState): SeriesPoint {
  return {
    q: state.quarter,
    label: quarterLabel(state.quarter),
    gdpGrowth: round2(state.gdpGrowth),
    inflation: round2(state.inflation),
    unemployment: round2(state.unemployment),
    minorityUnemployment: round2(state.minorityUnemployment),
    policyRate: round2(state.policyRate),
    bondYield: round2(state.bondYield),
    stockIndex: round2(state.stockIndex),
    housePriceIndex: round2(state.housePriceIndex),
    homelessness: round2(state.homelessness),
    debtToGdp: round2(state.debtToGdp),
    happiness: round2(state.happiness),
    gini: Math.round(state.gini * 1000) / 1000,
    socialMobility: round2(state.socialMobility),
    fxRate: round2(state.fxRate),
    tradeBalance: round2(state.tradeBalance),
    moneySupply: round2(state.moneySupply),
    healthCoverage: round2(state.healthCoverage),
    priceLevel: round2(state.priceLevel),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Run the model for a number of quarters from a fresh start. */
export function runSimulation(
  params: SimParams,
  quarters: number,
  seed = 16,
  init?: PresetInit,
): RunResult {
  const capped = Math.min(Math.max(1, Math.floor(quarters)), MAX_QUARTERS);
  let state = createInitialState(params, seed, init);
  const series: SeriesPoint[] = [];
  const events: SimEvent[] = [];
  for (let i = 0; i < capped; i += 1) {
    const result = stepQuarter(state, params);
    state = result.state;
    series.push(toSeriesPoint(state));
    events.push(...result.events);
  }
  return { finalState: state, series, events };
}

export { MAX_QUARTERS };
