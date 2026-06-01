import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatShortNumber,
  formatDataValue,
} from '../lib/format';

describe('formatCurrency', () => {
  it('formats positive USD values', () => {
    expect(formatCurrency(75000)).toBe('$75,000');
  });
  it('returns Data unavailable for null', () => {
    expect(formatCurrency(null)).toBe('Data unavailable');
  });
  it('returns Data unavailable for Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('Data unavailable');
  });
  it('returns Data unavailable for NaN', () => {
    expect(formatCurrency(NaN)).toBe('Data unavailable');
  });
});

describe('formatPercent', () => {
  it('formats percentage', () => {
    expect(formatPercent(3.5)).toBe('3.5%');
  });
  it('returns Data unavailable for null', () => {
    expect(formatPercent(null)).toBe('Data unavailable');
  });
  it('returns Data unavailable for Infinity', () => {
    expect(formatPercent(Infinity)).toBe('Data unavailable');
  });
});

describe('formatNumber', () => {
  it('formats integer', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
  it('returns Data unavailable for null', () => {
    expect(formatNumber(null)).toBe('Data unavailable');
  });
});

describe('formatShortNumber', () => {
  it('abbreviates millions', () => {
    expect(formatShortNumber(5_839_926)).toBe('5.8M');
  });
  it('abbreviates billions', () => {
    expect(formatShortNumber(1_200_000_000)).toBe('1.2B');
  });
  it('abbreviates thousands', () => {
    expect(formatShortNumber(75_000)).toBe('75.0K');
  });
  it('returns Data unavailable for null', () => {
    expect(formatShortNumber(null)).toBe('Data unavailable');
  });
});

describe('formatDataValue', () => {
  it('uses currency format for USD unit', () => {
    expect(formatDataValue(50000, 'USD')).toBe('$50,000');
  });
  it('uses percent format for percent unit', () => {
    expect(formatDataValue(3.5, 'percent')).toBe('3.5%');
  });
  it('returns Data unavailable for null', () => {
    expect(formatDataValue(null, 'USD')).toBe('Data unavailable');
  });
});
