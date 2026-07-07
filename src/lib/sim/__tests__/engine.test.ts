import { createInitialState, runSimulation, stepQuarter, MAX_QUARTERS } from '../engine';
import { DEFAULT_PARAMS, PARAM_DEFS } from '../params';
import { PRESETS, getPreset } from '../presets';
import type { SimParams } from '../types';

function withOverrides(overrides: Partial<SimParams>): SimParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

function presetParams(id: string): SimParams {
  const preset = getPreset(id);
  if (!preset) throw new Error(`missing preset ${id}`);
  return withOverrides(preset.overrides);
}

describe('engine determinism and safety', () => {
  it('produces identical histories for identical params and seed', () => {
    const a = runSimulation(DEFAULT_PARAMS, 80, 7);
    const b = runSimulation(DEFAULT_PARAMS, 80, 7);
    expect(a.finalState).toEqual(b.finalState);
    expect(a.series).toEqual(b.series);
    expect(a.events).toEqual(b.events);
  });

  it('never emits NaN or Infinity in any recorded series point', () => {
    const extreme = withOverrides({
      moneyPrinting: 300,
      deficitMonetization: 100,
      govSpending: 60,
      taxRate: 5,
      tariffRate: 70,
      retaliation: 100,
      oilShock: 4,
      speculation: 2,
      marginLeverage: 3,
      discrimination: 1,
    });
    const { series, finalState } = runSimulation(extreme, 200, 3);
    for (const point of series) {
      for (const value of Object.values(point)) {
        if (typeof value === 'number') {
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    }
    expect(Number.isFinite(finalState.priceLevel)).toBe(true);
  });

  it('caps runs at MAX_QUARTERS', () => {
    const { series } = runSimulation(DEFAULT_PARAMS, 10000, 1);
    expect(series.length).toBe(MAX_QUARTERS);
  });

  it('steps one quarter at a time from an initial state', () => {
    const initial = createInitialState(DEFAULT_PARAMS, 5);
    const { state } = stepQuarter(initial, DEFAULT_PARAMS);
    expect(state.quarter).toBe(1);
    expect(state.gdp).toBeGreaterThan(0);
  });
});

describe('baseline behavior', () => {
  const run = runSimulation(DEFAULT_PARAMS, 120, 16);

  it('keeps a well-run economy inside sane bounds', () => {
    const tail = run.series.slice(-40);
    for (const point of tail) {
      expect(point.unemployment).toBeGreaterThan(2);
      expect(point.unemployment).toBeLessThan(15);
      expect(point.inflation).toBeGreaterThan(-6);
      expect(point.inflation).toBeLessThan(18);
    }
  });

  it('grows the economy over thirty years', () => {
    expect(run.finalState.gdp).toBeGreaterThan(600);
  });
});

describe('scenario dynamics', () => {
  it('hyperinflation preset produces runaway inflation and misery', () => {
    const run = runSimulation(presetParams('hyperinflation'), 60, 16);
    const maxInflation = Math.max(...run.series.map(p => p.inflation));
    expect(maxInflation).toBeGreaterThan(100);
    expect(run.finalState.priceLevel).toBeGreaterThan(300);
    const baseline = runSimulation(DEFAULT_PARAMS, 60, 16);
    expect(run.finalState.happiness).toBeLessThan(baseline.finalState.happiness);
  });

  it('tight money produces lower inflation than loose money', () => {
    const loose = runSimulation(
      withOverrides({ cbAuto: false, policyRateManual: 0.5, moneyPrinting: 40 }),
      60,
      16,
    );
    const tight = runSimulation(
      withOverrides({ cbAuto: false, policyRateManual: 14, moneyPrinting: 40 }),
      60,
      16,
    );
    const avg = (points: number[]) => points.reduce((a, b) => a + b, 0) / points.length;
    const looseAvg = avg(loose.series.slice(-20).map(p => p.inflation));
    const tightAvg = avg(tight.series.slice(-20).map(p => p.inflation));
    expect(tightAvg).toBeLessThan(looseAvg);
  });

  it('a trade war shrinks trade and raises prices', () => {
    const war = runSimulation(presetParams('trade-war'), 40, 16);
    const peace = runSimulation(DEFAULT_PARAMS, 40, 16);
    const warVolume = war.finalState.exports + war.finalState.imports;
    const peaceVolume = peace.finalState.exports + peace.finalState.imports;
    expect(warVolume).toBeLessThan(peaceVolume);
    expect(war.finalState.priceLevel).toBeGreaterThan(peace.finalState.priceLevel);
  });

  it('the gold standard freezes money growth that fiat printing allows', () => {
    const gold = runSimulation(
      withOverrides({ goldStandard: true, goldCoverRatio: 90, moneyPrinting: 50 }),
      60,
      16,
    );
    const fiat = runSimulation(withOverrides({ moneyPrinting: 50 }), 60, 16);
    const goldGrowth = gold.finalState.moneySupply / 480 - 1;
    const fiatGrowth = fiat.finalState.moneySupply / 480 - 1;
    expect(goldGrowth).toBeLessThan(0.1);
    expect(fiatGrowth).toBeGreaterThan(goldGrowth + 0.5);
  });

  it('1929 settings inflate a bubble and then crash it', () => {
    const run = runSimulation(presetParams('crash-1929'), 160, 16);
    expect(run.finalState.crashCount).toBeGreaterThanOrEqual(1);
    let peak = 0;
    let maxDrawdown = 0;
    for (const point of run.series) {
      peak = Math.max(peak, point.stockIndex);
      maxDrawdown = Math.max(maxDrawdown, (peak - point.stockIndex) / peak);
    }
    expect(maxDrawdown).toBeGreaterThan(0.2);
  });

  it('discrimination opens an unemployment gap and destroys mobility', () => {
    const excluded = runSimulation(presetParams('exclusion'), 80, 16);
    const baseline = runSimulation(DEFAULT_PARAMS, 80, 16);
    const gap = excluded.finalState.minorityUnemployment - excluded.finalState.unemployment;
    expect(gap).toBeGreaterThan(3);
    expect(excluded.finalState.socialMobility).toBeLessThan(baseline.finalState.socialMobility);
    expect(excluded.finalState.gdp).toBeLessThan(baseline.finalState.gdp);
  });

  it('a safety net holds homelessness down', () => {
    const generous = runSimulation(withOverrides({ safetyNet: 9 }), 60, 16);
    const bare = runSimulation(withOverrides({ safetyNet: 0 }), 60, 16);
    expect(generous.finalState.homelessness).toBeLessThan(bare.finalState.homelessness);
  });

  it('public coverage expands insurance', () => {
    const universal = runSimulation(withOverrides({ publicCoverage: 100 }), 40, 16);
    const none = runSimulation(withOverrides({ publicCoverage: 0, publicHealthSpend: 0 }), 40, 16);
    expect(universal.finalState.healthCoverage).toBeGreaterThan(none.finalState.healthCoverage + 10);
    expect(universal.finalState.medicalBankruptcies).toBeLessThan(none.finalState.medicalBankruptcies);
  });

  it('the sovereign debt scenario ends in stress: punitive yields, and default or runaway debt', () => {
    const preset = getPreset('debt-crisis');
    expect(preset).toBeDefined();
    const run = runSimulation(withOverrides(preset!.overrides), 120, 16, preset!.init);
    const maxYield = Math.max(...run.series.map(p => p.bondYield));
    expect(maxYield).toBeGreaterThan(8);
    const maxDebt = Math.max(...run.series.map(p => p.debtToGdp));
    expect(run.finalState.defaulted || maxDebt > 160).toBe(true);
  });

  it('loose mortgage rules inflate house prices against rents', () => {
    const preset = presetParams('housing-2008');
    const run = runSimulation(preset, 80, 16);
    let maxRatio = 0;
    for (const point of run.series) {
      maxRatio = Math.max(maxRatio, point.housePriceIndex);
    }
    const baseline = runSimulation(DEFAULT_PARAMS, 80, 16);
    let baseMax = 0;
    for (const point of baseline.series) {
      baseMax = Math.max(baseMax, point.housePriceIndex);
    }
    expect(maxRatio).toBeGreaterThan(baseMax);
  });
});

describe('definitions integrity', () => {
  it('every param def points at a real default and stays in range', () => {
    for (const def of PARAM_DEFS) {
      const value = DEFAULT_PARAMS[def.key];
      if (def.kind === 'slider') {
        expect(typeof value).toBe('number');
        const v = value as number;
        expect(v).toBeGreaterThanOrEqual(def.min);
        expect(v).toBeLessThanOrEqual(def.max);
      } else {
        expect(typeof value).toBe('boolean');
      }
    }
  });

  it('every preset override references real params within slider bounds', () => {
    const sliders = new Map(PARAM_DEFS.filter(d => d.kind === 'slider').map(d => [d.key, d]));
    for (const preset of PRESETS) {
      for (const [key, value] of Object.entries(preset.overrides)) {
        expect(key in DEFAULT_PARAMS).toBe(true);
        const def = sliders.get(key as never);
        if (def && def.kind === 'slider' && typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(def.min);
          expect(value).toBeLessThanOrEqual(def.max);
        }
      }
    }
  });

  it('presets have unique ids', () => {
    const ids = PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
