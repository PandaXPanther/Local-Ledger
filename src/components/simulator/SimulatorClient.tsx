'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialState,
  quarterLabel,
  stepQuarter,
  toSeriesPoint,
  MAX_QUARTERS,
} from '@/lib/sim/engine';
import { DEFAULT_PARAMS, PARAM_GROUPS, defsForGroup } from '@/lib/sim/params';
import { PRESETS, getPreset } from '@/lib/sim/presets';
import type {
  ParamDef,
  Preset,
  SeriesPoint,
  SimEvent,
  SimParams,
  SimState,
  SliderDef,
  ToggleDef,
} from '@/lib/sim/types';
import { SimCharts } from './SimCharts';

const SPEEDS = [1, 2, 5, 10] as const;
const SEED = 16;

function formatDialValue(def: SliderDef, value: number): string {
  switch (def.format) {
    case 'percent':
      return `${Number(value.toFixed(2))}%`;
    case 'multiplier':
      return `${value.toFixed(1)}x`;
    case 'ratio':
      return value.toFixed(2);
    default:
      return `${Number(value.toFixed(1))}`;
  }
}

function num(value: number, decimals = 1): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

interface DialProps {
  def: SliderDef;
  value: number;
  defaultValue: number;
  onChange: (key: SliderDef['key'], value: number) => void;
}

function Dial({ def, value, defaultValue, onChange }: DialProps) {
  const changed = Math.abs(value - defaultValue) > 1e-9;
  return (
    <div className="border-b border-machine-line px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`dial-${def.key}`} className="text-[0.8rem] font-medium text-cream/90">
          {def.label}
        </label>
        <span className={`font-mono text-xs font-bold tnum ${changed ? 'text-accent-bright' : 'text-cream/60'}`}>
          {formatDialValue(def, value)}
        </span>
      </div>
      <input
        id={`dial-${def.key}`}
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={event => onChange(def.key, Number(event.target.value))}
        className="sim-range mt-2 w-full"
        aria-label={def.label}
      />
      <p className="mt-1.5 text-[0.7rem] leading-snug text-cream/45">{def.note}</p>
    </div>
  );
}

interface SwitchProps {
  def: ToggleDef;
  value: boolean;
  onChange: (key: ToggleDef['key'], value: boolean) => void;
}

function Switch({ def, value, onChange }: SwitchProps) {
  return (
    <div className="border-b border-machine-line px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.8rem] font-medium text-cream/90">{def.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-label={def.label}
          onClick={() => onChange(def.key, !value)}
          className={`rounded-md border px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.1em] transition-colors ${
            value
              ? 'border-accent-bright/60 bg-accent-bright/15 text-accent-bright'
              : 'border-machine-line bg-machine text-cream/60'
          }`}
        >
          {value ? def.onLabel : def.offLabel}
        </button>
      </div>
      <p className="mt-1.5 text-[0.7rem] leading-snug text-cream/45">{def.note}</p>
    </div>
  );
}

function Readout({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const toneClass = tone === 'good' ? 'text-up' : tone === 'bad' ? 'text-down' : 'text-cream';
  return (
    <div className="rounded-[10px] border border-machine-line bg-machine-panel px-3 py-2.5">
      <div className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-cream/50">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-bold tnum ${toneClass}`}>{value}</div>
      {sub && <div className="font-mono text-[0.6rem] text-cream/40">{sub}</div>}
    </div>
  );
}

function severityClass(severity: SimEvent['severity']): string {
  switch (severity) {
    case 'crisis':
      return 'border-down text-down';
    case 'warn':
      return 'border-[#C9A94E] text-[#C9A94E]';
    case 'good':
      return 'border-up text-up';
    default:
      return 'border-cream/40 text-cream/70';
  }
}

export function SimulatorClient() {
  const [params, setParams] = useState<SimParams>({ ...DEFAULT_PARAMS });
  const [simState, setSimState] = useState<SimState>(() => createInitialState(DEFAULT_PARAMS, SEED));
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [activePreset, setActivePreset] = useState<string>('baseline');

  const stateRef = useRef(simState);
  const paramsRef = useRef(params);
  stateRef.current = simState;
  paramsRef.current = params;

  const applyPreset = useCallback((preset: Preset) => {
    const nextParams: SimParams = { ...DEFAULT_PARAMS, ...preset.overrides };
    setRunning(false);
    setParams(nextParams);
    setSimState(createInitialState(nextParams, SEED, preset.init));
    setSeries([]);
    setEvents([]);
    setActivePreset(preset.id);
  }, []);

  // Deep links: /simulator/?scenario=hyperinflation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('scenario');
    if (!id) return;
    const preset = getPreset(id);
    if (preset) applyPreset(preset);
  }, [applyPreset]);

  const stepOnce = useCallback(() => {
    const current = stateRef.current;
    if (current.quarter >= MAX_QUARTERS) {
      setRunning(false);
      return;
    }
    const { state, events: newEvents } = stepQuarter(current, paramsRef.current);
    setSimState(state);
    setSeries(prevSeries => [...prevSeries, toSeriesPoint(state)]);
    if (newEvents.length > 0) {
      setEvents(prevEvents => [...newEvents, ...prevEvents].slice(0, 60));
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(stepOnce, 1000 / SPEEDS[speedIndex]);
    return () => window.clearInterval(interval);
  }, [running, speedIndex, stepOnce]);

  const reset = useCallback(() => {
    const preset = getPreset(activePreset);
    if (preset) {
      applyPreset(preset);
    } else {
      setRunning(false);
      setSimState(createInitialState(paramsRef.current, SEED));
      setSeries([]);
      setEvents([]);
    }
  }, [activePreset, applyPreset]);

  const onDial = useCallback((key: SliderDef['key'], value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const onSwitch = useCallback((key: ToggleDef['key'], value: boolean) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const year = Math.floor((Math.max(1, simState.quarter) - 1) / 4) + 1;
  const tickerItems = useMemo(
    () => [
      `GDP GROWTH ${num(simState.gdpGrowth)}%`,
      `INFLATION ${num(simState.inflation)}%`,
      `UNEMPLOYMENT ${num(simState.unemployment)}%`,
      `POLICY RATE ${num(simState.policyRate, 2)}%`,
      `10Y YIELD ${num(simState.bondYield, 2)}%`,
      `STOCKS ${num(simState.stockIndex, 0)}`,
      `HOUSING ${num(simState.housePriceIndex, 0)}`,
      `DEBT/GDP ${num(simState.debtToGdp, 0)}%`,
      `FX ${num(simState.fxRate, 0)}`,
      `GOLD ${num(simState.goldPrice, 0)}`,
      `OIL ${num(simState.oilPrice, 0)}`,
      `GINI ${simState.gini.toFixed(3)}`,
      `MOBILITY ${num(simState.socialMobility, 0)}`,
      `HAPPINESS ${num(simState.happiness, 0)}`,
      `HOMELESS ${num(simState.homelessness, 0)}/10K`,
      `COVERAGE ${num(simState.healthCoverage, 0)}%`,
    ],
    [simState],
  );

  const flags: { label: string; tone: string }[] = [];
  if (simState.inRecession) flags.push({ label: 'RECESSION', tone: 'border-[#C9A94E] text-[#C9A94E]' });
  if (simState.hyperinflation) flags.push({ label: 'HYPERINFLATION', tone: 'border-down text-down' });
  if (simState.defaulted) flags.push({ label: 'DEFAULTED', tone: 'border-down text-down' });
  if (simState.moralHazard > 0.4) flags.push({ label: 'MORAL HAZARD', tone: 'border-[#C9A94E] text-[#C9A94E]' });
  if (simState.quarter >= MAX_QUARTERS) flags.push({ label: 'RUN COMPLETE', tone: 'border-cream/50 text-cream/70' });
  if (flags.length === 0) flags.push({ label: 'ALL SAFETIES OFF', tone: 'border-accent-bright/60 text-accent-bright' });

  return (
    <div className="bg-machine text-cream">
      {/* Scenario rail */}
      <div className="border-b border-machine-line">
        <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cream/50">
              Load a scenario
            </span>
            <span className="hidden font-mono text-[0.62rem] text-cream/35 sm:block">
              Dials stay live while the machine runs
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Preset scenarios">
            {PRESETS.map((preset, index) => (
              <button
                key={preset.id}
                type="button"
                role="listitem"
                onClick={() => applyPreset(preset)}
                className={`min-w-[190px] shrink-0 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                  activePreset === preset.id
                    ? 'border-accent-bright bg-accent-bright/10'
                    : 'border-machine-line bg-machine-panel hover:border-cream/40'
                }`}
              >
                <div className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-cream/45">
                  Scenario {String(index + 1).padStart(2, '0')} / {preset.era}
                </div>
                <div className={`mt-0.5 font-display text-sm font-bold ${activePreset === preset.id ? 'text-accent-bright' : 'text-cream'}`}>
                  {preset.name}
                </div>
                <div className="mt-0.5 text-[0.68rem] leading-snug text-cream/55">{preset.tagline}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transport bar */}
      <div className="sticky top-16 z-30 border-b border-machine-line bg-machine/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setRunning(value => !value)}
            className="btn-machine min-w-24 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em]"
          >
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            onClick={stepOnce}
            className="rounded-md border border-machine-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-cream/50 hover:text-cream"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => setSpeedIndex(index => (index + 1) % SPEEDS.length)}
            className="rounded-md border border-machine-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-cream/50 hover:text-cream"
            aria-label={`Simulation speed ${SPEEDS[speedIndex]} quarters per second`}
          >
            {SPEEDS[speedIndex]}x
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-machine-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-down/70 hover:text-down"
          >
            Reset
          </button>
          <span className="ml-auto font-mono text-sm font-bold tnum text-cream">
            YEAR {year} <span className="text-cream/50">/ {quarterLabel(simState.quarter || 1)}</span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {flags.map(flag => (
              <span
                key={flag.label}
                className={`rounded-md border px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] ${flag.tone}`}
              >
                {flag.label}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Machine floor */}
      <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[330px_1fr]">
        {/* Control rail */}
        <aside aria-label="Policy controls">
          <div className="rounded-[10px] border border-machine-line bg-machine-panel">
            <div className="border-b border-machine-line px-4 py-3">
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent-bright">
                Control rail / 41 dials, no interlocks
              </span>
            </div>
            {PARAM_GROUPS.map((group, groupIndex) => (
              <details key={group.key} open={groupIndex === 0} className="group border-b border-machine-line last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-machine">
                  <span>
                    <span className="block text-sm font-semibold text-cream">{group.label}</span>
                    <span className="block text-[0.68rem] text-cream/45">{group.blurb}</span>
                  </span>
                  <span className="font-mono text-xs text-cream/50 transition-transform group-open:rotate-90">&gt;</span>
                </summary>
                <div className="bg-machine/60">
                  {defsForGroup(group.key).map((def: ParamDef) =>
                    def.kind === 'slider' ? (
                      <Dial
                        key={def.key}
                        def={def}
                        value={params[def.key] as number}
                        defaultValue={DEFAULT_PARAMS[def.key] as number}
                        onChange={onDial}
                      />
                    ) : (
                      <Switch key={def.key} def={def} value={params[def.key] as boolean} onChange={onSwitch} />
                    ),
                  )}
                </div>
              </details>
            ))}
          </div>
        </aside>

        {/* Readouts, charts, event log */}
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Current readings">
            <Readout
              label="GDP growth"
              value={`${num(simState.gdpGrowth)}%`}
              tone={simState.gdpGrowth < 0 ? 'bad' : 'good'}
            />
            <Readout
              label="Inflation"
              value={`${num(simState.inflation)}%`}
              tone={simState.inflation > 6 || simState.inflation < -1 ? 'bad' : 'neutral'}
            />
            <Readout
              label="Unemployment"
              value={`${num(simState.unemployment)}%`}
              sub={`excluded group ${num(simState.minorityUnemployment)}%`}
              tone={simState.unemployment > 8 ? 'bad' : 'neutral'}
            />
            <Readout label="Policy rate" value={`${num(simState.policyRate, 2)}%`} />
            <Readout
              label="Debt / GDP"
              value={`${num(simState.debtToGdp, 0)}%`}
              tone={simState.debtToGdp > 120 ? 'bad' : 'neutral'}
            />
            <Readout
              label="Happiness"
              value={num(simState.happiness, 0)}
              sub={`mobility ${num(simState.socialMobility, 0)} / gini ${simState.gini.toFixed(2)}`}
              tone={simState.happiness < 45 ? 'bad' : simState.happiness > 70 ? 'good' : 'neutral'}
            />
          </div>

          {series.length === 0 ? (
            <div className="hud-frame flex min-h-[300px] flex-col items-center justify-center rounded-[10px] border border-machine-line bg-machine-panel px-6 py-16 text-center text-cream/70">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-accent-bright">
                Machine idle
              </p>
              <p className="mt-3 max-w-md font-display text-2xl font-bold text-cream">
                Ten million citizens are waiting for your first mistake.
              </p>
              <p className="mt-2 max-w-md text-sm text-cream/55">
                Press Run to start the clock, or load a scenario above. Every dial stays live while
                the machine is running, so you can fight the fire you started.
              </p>
            </div>
          ) : (
            <SimCharts data={series} />
          )}

          <div className="rounded-[10px] border border-machine-line bg-machine-panel">
            <div className="flex items-center justify-between border-b border-machine-line px-4 py-2.5">
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cream/60">
                Event log
              </span>
              <span className="font-mono text-[0.6rem] text-cream/35">{events.length} recorded</span>
            </div>
            <ul className="max-h-64 overflow-y-auto px-4 py-2" aria-live="polite">
              {events.length === 0 && (
                <li className="py-2 font-mono text-xs text-cream/40">
                  No events yet. Stability is an achievement; it will not survive contact with the dials.
                </li>
              )}
              {events.map((event, index) => (
                <li
                  key={`${event.quarter}-${index}`}
                  className={`my-1.5 border-l-2 py-0.5 pl-3 text-[0.78rem] leading-snug ${severityClass(event.severity)}`}
                >
                  <span className="mr-2 font-mono text-[0.62rem] font-bold text-cream/45">
                    {quarterLabel(event.quarter)}
                  </span>
                  <span className="text-cream/85">{event.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <div className="overflow-hidden border-t border-machine-line bg-machine" aria-hidden="true">
        <div className="ticker-track flex w-max gap-8 whitespace-nowrap px-4 py-2">
          {[0, 1].map(copy => (
            <span key={copy} className="flex gap-8">
              {tickerItems.map(item => (
                <span key={`${copy}-${item}`} className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-cream/50">
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
