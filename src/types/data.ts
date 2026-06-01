/**
 * Core data types for LocalLedger.
 * Every displayed metric must carry full provenance.
 */

export interface DataPoint {
  value: number | null;
  unit: string;
  geography: string;
  date: string;               // ISO 8601
  sourceName: string;
  sourceUrl: string;
  sourceDataset: string;
  sourceSeriesId?: string;
  lastFetchedAt: string;      // ISO 8601
  transformation?: string;
  methodologyNote?: string;
}

export interface CountyRecord {
  fips: string;
  county: string;
  state: string;
  population: DataPoint;
  medianHouseholdIncome: DataPoint;
  unemploymentRate: DataPoint;
  populationGrowth: DataPoint;
  federalSpendingPerCapita: DataPoint;
  housingPressureScore: DataPoint;
  localEconomyScore: DataPoint;
}

export interface CityScorecard {
  city: string;
  state: string;
  population: DataPoint;
  unemploymentRate: DataPoint;
  medianHouseholdIncome: DataPoint;
  medianHomeValue: DataPoint;
  laborForceParticipation: DataPoint;
  gdpPerCapita?: DataPoint;
  localEconomyScore: DataPoint;
  lastUpdated: string;
}

export interface CollegeRecord {
  unitId: string;
  name: string;
  city: string;
  state: string;
  type: string;
  netPrice: DataPoint;
  graduationRate: DataPoint;
  medianEarnings: DataPoint;
  medianDebt: DataPoint;
  debtToEarningsRatio: DataPoint;
  valueScore: DataPoint;
}

export interface FederalSpendingRecord {
  fiscalYear: number;
  awardType: 'grant' | 'contract' | 'loan' | 'direct_payment' | 'other';
  agency: string;
  amount: number;
  county?: string;
  recipient?: string;
  perCapita?: number;
  source: {
    name: string;
    url: string;
    dataset: string;
    lastFetchedAt: string;
  };
}

export interface RecessionIndicator {
  overall: 'low' | 'moderate' | 'elevated';
  score: number;           // 0-100
  components: {
    unemploymentTrend: 'rising' | 'stable' | 'falling';
    housingActivity: 'contracting' | 'stable' | 'expanding';
    laborMarket: 'weakening' | 'stable' | 'strengthening';
    consumerConfidence?: 'low' | 'neutral' | 'high';
  };
  lastUpdated: string;
  methodologyNote: string;
  sources: Array<{
    name: string;
    url: string;
    dataset: string;
  }>;
}

export interface LocalEconomyScoreBreakdown {
  total: number;           // 0-100
  labor: number;           // weight: 30
  income: number;          // weight: 25
  affordability: number;   // weight: 20
  population: number;      // weight: 15
  fiscal: number;          // weight: 10
  methodologyNote: string;
  sources: string[];
}

export interface MetricMetadata {
  id: string;
  name: string;
  description: string;
  unit: string;
  source: string;
  sourceUrl: string;
  dataset: string;
  seriesId?: string;
  geography: string;
  frequency: 'annual' | 'quarterly' | 'monthly';
  lastUpdated: string;
  transformation?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'elevated';
export type TrendDirection = 'rising' | 'stable' | 'falling';
