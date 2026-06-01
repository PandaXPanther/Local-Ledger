export const SITE_NAME = 'LocalLedger';
export const SITE_DESCRIPTION =
  'LocalLedger transforms official labor, income, housing, education, business, and public finance data into readable dashboards, scorecards, and economic briefs.';
export const SITE_URL = 'https://local-ledger.net';

export const NAV_LINKS = [
  { label: 'Explore', href: '/states/' },
  { label: 'Rankings', href: '/rankings/' },
  { label: 'Methodology', href: '/methodology/' },
  { label: 'Sources', href: '/sources/' },
  { label: 'About', href: '/about/' },
];

export const EXPLORE_LINKS = [
  { label: 'States', href: '/states/' },
  { label: 'Counties', href: '/counties/' },
  { label: 'Metros', href: '/metros/' },
  { label: 'College ROI', href: '/rankings/most-affordable-college-states/' },
  { label: 'Federal Spending', href: '/rankings/federal-spending-per-capita/' },
  { label: 'API', href: '/api/' },
  { label: 'Featured: Colorado', href: '/colorado/' },
];

export const COLORADO_CITIES = [
  { label: 'Denver', href: '/colorado/denver/', fips: '08031' },
  { label: 'Boulder', href: '/colorado/boulder/', fips: '08013' },
  { label: 'Colorado Springs', href: '/colorado/colorado-springs/', fips: '08041' },
  { label: 'Fort Collins', href: '/colorado/fort-collins/', fips: '08069' },
  { label: 'Aurora', href: '/colorado/aurora/', fips: '08005' },
];

export const DATA_SOURCES = {
  FRED: {
    name: 'Federal Reserve Economic Data (FRED)',
    url: 'https://fred.stlouisfed.org/',
    description: 'Economic time series from the Federal Reserve Bank of St. Louis.',
  },
  BLS: {
    name: 'Bureau of Labor Statistics (BLS)',
    url: 'https://www.bls.gov/',
    description: 'Labor force statistics, employment, wages.',
  },
  CENSUS: {
    name: 'U.S. Census Bureau',
    url: 'https://www.census.gov/',
    description: 'Population estimates, ACS income, housing data.',
  },
  BEA: {
    name: 'Bureau of Economic Analysis (BEA)',
    url: 'https://www.bea.gov/',
    description: 'GDP, personal income, regional accounts.',
  },
  COLLEGE_SCORECARD: {
    name: 'College Scorecard (U.S. Dept. of Education)',
    url: 'https://collegescorecard.ed.gov/',
    description: 'Institutional performance, earnings, debt, graduation.',
  },
  USASPENDING: {
    name: 'USAspending.gov',
    url: 'https://www.usaspending.gov/',
    description: 'Federal award spending by geography, agency, recipient.',
  },
};

// Local Economy Score weights (must sum to 100)
export const LOCAL_ECONOMY_SCORE_WEIGHTS = {
  labor: 30,
  income: 25,
  affordability: 20,
  population: 15,
  fiscal: 10,
} as const;

// Recession thresholds
export const RECESSION_THRESHOLDS = {
  low: { max: 33 },
  moderate: { min: 34, max: 66 },
  elevated: { min: 67 },
};

// Trend thresholds (% change)
export const TREND_THRESHOLDS = {
  rising: 0.5,   // > +0.5% considered rising
  falling: -0.5, // < -0.5% considered falling
};
