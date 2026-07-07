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
    <div className="border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`dial-${def.key}`} className="text-[0.8rem] font-medium text-text-primary">
          {def.label}
        </label>
        <span className={`font-mono text-xs font-bold tabular-nums ${changed ? 'text-accent' : 'text-text-muted'}`}>
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
      <p className="mt-1.5 text-[0.7rem] leading-snug text-text-muted">{def.note}</p>
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
    <div className="border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.8rem] font-medium text-text-primary">{def.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-label={def.label}
          onClick={() => onChange(def.key, !value)}
          className={`rounded-full border px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.1em] transition-colors ${
            value
              ? 'border-accent/50 bg-accent-soft text-accent'
              : 'border-border bg-canvas text-text-muted'
          }`}
        >
          {value ? def.onLabel : def.offLabel}
        </button>
      </div>
      <p className="mt-1.5 text-[0.7rem] leading-snug text-text-muted">{def.note}</p>
    </div>
  );
}

function Readout({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const toneClass = tone === 'good' ? 'text-success' : tone === 'bad' ? 'text-danger' : 'text-ink';
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-[0_1px_0_rgba(31,36,33,0.08)]">
      <div className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-text-muted">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-bold tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="font-mono text-[0.6rem] text-text-muted">{sub}</div>}
    </div>
  );
}

function severityClass(severity: SimEvent['severity']): string {
  switch (severity) {
    case 'crisis':
      return 'border-danger text-danger';
    case 'warn':
      return 'border-warning text-warning';
    case 'good':
      return 'border-success text-success';
    default:
      return 'border-rule text-text-secondary';
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
  if (simState.inRecession) flags.push({ label: 'RECESSION', tone: 'border-warning/50 text-warning' });
  if (simState.hyperinflation) flags.push({ label: 'HYPERINFLATION', tone: 'border-danger/50 text-danger' });
  if (simState.defaulted) flags.push({ label: 'DEFAULTED', tone: 'border-danger/50 text-danger' });
  if (simState.moralHazard > 0.4) flags.push({ label: 'MORAL HAZARD', tone: 'border-warning/50 text-warning' });
  if (simState.quarter >= MAX_QUARTERS) flags.push({ label: 'RUN COMPLETE', tone: 'border-rule text-text-secondary' });
  if (flags.length === 0) flags.push({ label: 'STEADY', tone: 'border-success/50 text-success' });

  return (
    <div className="bg-background text-text-primary">
      {/* Scenario shelf */}
      <div className="border-b border-rule bg-canvas/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="section-label">Load a scenario</span>
            <span className="hidden font-mono text-[0.62rem] text-text-muted sm:block">
              Dials stay live while it runs
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Preset scenarios">
            {PRESETS.map((preset, index) => (
              <button
                key={preset.id}
                type="button"
                role="listitem"
                onClick={() => applyPreset(preset)}
                className={`min-w-[190px] shrink-0 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  activePreset === preset.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-border bg-surface hover:border-rule'
                }`}
              >
                <div className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                  Scenario {String(index + 1).padStart(2, '0')} / {preset.era}
                </div>
                <div className={`mt-0.5 font-display text-sm font-bold ${activePreset === preset.id ? 'text-accent' : 'text-ink'}`}>
                  {preset.name}
                </div>
                <div className="mt-0.5 text-[0.68rem] leading-snug text-text-secondary">{preset.tagline}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transport bar */}
      <div className="sticky top-16 z-30 border-b border-rule bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setRunning(value => !value)}
            className="btn-primary min-w-24 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em]"
          >
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            onClick={stepOnce}
            className="rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-rule hover:text-ink"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => setSpeedIndex(index => (index + 1) % SPEEDS.length)}
            className="rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-rule hover:text-ink"
            aria-label={`Simulation speed ${SPEEDS[speedIndex]} quarters per second`}
          >
            {SPEEDS[speedIndex]}x
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-danger/50 hover:text-danger"
          >
            Reset
          </button>
          <span className="ml-auto font-mono text-sm font-bold tabular-nums text-ink">
            YEAR {year} <span className="text-text-muted">/ {quarterLabel(simState.quarter || 1)}</span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {flags.map(flag => (
              <span
                key={flag.label}
                className={`rounded-full border px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] ${flag.tone}`}
              >
                {flag.label}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Simulator floor */}
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[330px_1fr] lg:px-8">
        {/* Policy controls */}
        <aside aria-label="Policy controls">
          <div className="rounded-lg border border-border bg-surface shadow-[0_1px_0_rgba(31,36,33,0.08)]">
            <div className="border-b border-border px-4 py-3">
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
                Policy controls / 41 dials
              </span>
            </div>
            {PARAM_GROUPS.map((group, groupIndex) => (
              <details key={group.key} open={groupIndex === 0} className="group border-b border-border last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-canvas">
                  <span>
                    <span className="block text-sm font-semibold text-ink">{group.label}</span>
                    <span className="block text-[0.68rem] text-text-muted">{group.blurb}</span>
                  </span>
                  <span className="font-mono text-xs text-text-muted transition-transform group-open:rotate-90">&gt;</span>
                </summary>
                <div className="bg-background/60">
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
            <div className="card flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="section-label text-accent">Ready when you are</p>
              <p className="mt-3 max-w-md font-display text-2xl font-bold text-ink">
                Ten million simulated people are waiting for your first mistake.
              </p>
              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Press Run to start the clock, or load a scenario above. The dials stay live while it
                runs, so you can fight the fire you started.
              </p>
            </div>
          ) : (
            <SimCharts data={series} />
          )}

          <div className="rounded-lg border border-border bg-surface shadow-[0_1px_0_rgba(31,36,33,0.08)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="section-label">Event log</span>
              <span className="font-mono text-[0.6rem] text-text-muted">{events.length} recorded</span>
            </div>
            <ul className="max-h-64 overflow-y-auto px-4 py-2" aria-live="polite">
              {events.length === 0 && (
                <li className="py-2 font-mono text-xs text-text-muted">
                  No events yet. Stability never survives contact with the dials.
                </li>
              )}
              {events.map((event, index) => (
                <li
                  key={`${event.quarter}-${index}`}
                  className={`my-1.5 border-l-2 py-0.5 pl-3 text-[0.78rem] leading-snug ${severityClass(event.severity)}`}
                >
                  <span className="mr-2 font-mono text-[0.62rem] font-bold text-text-muted">
                    {quarterLabel(event.quarter)}
                  </span>
                  <span className="text-text-primary">{event.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <div className="overflow-hidden border-t border-rule bg-ink" aria-hidden="true">
        <div className="ticker-track flex w-max gap-8 whitespace-nowrap px-4 py-2">
          {[0, 1].map(copy => (
            <span key={copy} className="flex gap-8">
              {tickerItems.map(item => (
                <span key={`${copy}-${item}`} className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-background/60">
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
