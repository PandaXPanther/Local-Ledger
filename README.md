# LocalLedger - Public Economic Intelligence

Public economic intelligence for every community. LocalLedger transforms official labor, income, housing, education, business, and public finance data into readable dashboards, scorecards, and economic briefs.

**Live:** https://localledger.pages.dev

---

## What it does

- **National State Dashboards** - `/states` plus one dashboard per state
- **County Dashboards** - top county pages plus full county static JSON by state
- **Metro Previews** - major place-based metro pages from Census ACS
- **Colorado Overview** - statewide KPIs, trend charts, city comparison
- **City Dashboards** - Denver, Boulder, Colorado Springs, Fort Collins, Aurora with scorecards and trend data
- **64 Counties** - searchable/sortable table with population, income, unemployment, housing, federal spending, and economy score
- **College ROI** - College Scorecard data: net price, graduation, earnings, debt, debt-to-earnings, value score
- **Federal Spending** - USAspending.gov: grants, contracts, loans, per-capita, agency breakdown
- **Recession Radar** - educational slowdown risk indicator with transparent methodology
- **Methodology** - fully documented score formulas, thresholds, and data sources
- **Rankings** - best local economies, income, college affordability, and federal spending
- **Static JSON API** - all processed data published at `/data/processed/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Package manager | pnpm 9 |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |
| Data | Static JSON, generated at build time from official APIs |

---

## Data Sources

LocalLedger uses **only official public data sources**:

| Source | Data |
|---|---|
| [FRED (Federal Reserve)](https://fred.stlouisfed.org/) | Unemployment, GDP, income, population |
| [Bureau of Labor Statistics](https://www.bls.gov/) | Labor force, employment detail |
| [U.S. Census Bureau (ACS)](https://www.census.gov/) | Population, income, housing |
| [Bureau of Economic Analysis](https://www.bea.gov/) | Regional GDP, personal income |
| [College Scorecard](https://collegescorecard.ed.gov/) | Costs, earnings, graduation, debt |
| [USAspending.gov](https://www.usaspending.gov/) | Federal awards by geography |

---

## Data Integrity Rules

1. **No fabricated data** - if unavailable, displays "Data unavailable", never an estimate
2. **Every metric cites its source** - name, URL, dataset, geography, date, lastFetchedAt
3. **Build fails on missing citations** - `pnpm data:validate` enforces this
4. **No impossible values** - NaN, Infinity, negative rates cause build failure
5. **No mock/demo strings** - forbidden in production data files
6. **Computed scores are transparent** - all formulas documented in `/methodology/`

---

## Local Development

### Prerequisites

- Node.js 22+
- pnpm 9+
- API keys (optional, see below)

### Setup

```bash
git clone https://github.com/PandaXPanther/localledger.git
cd localledger
pnpm install
```

### API Keys (optional)

Create a `.env` or `.env.local` file:

```env
FRED_API_KEY=your_fred_key         # https://fred.stlouisfed.org/docs/api/api_key.html
CENSUS_API_KEY=your_census_key     # https://api.census.gov/data/key_signup.html
COLLEGE_SCORECARD_API_KEY=your_key # https://api.data.gov/signup/
BEA_API_KEY=your_bea_key           # https://apps.bea.gov/api/signup/
```

Without API keys, the data pipeline writes explicit structured unavailable values with source attempt reasons. Production builds should use keys.

### Commands

```bash
pnpm dev           # Development server
pnpm data:fetch    # Fetch data from official APIs
pnpm data:validate # Validate data integrity (fails on violations)
pnpm typecheck     # TypeScript type check
pnpm lint          # ESLint
pnpm test          # Jest unit tests
pnpm build         # Full build (runs data:fetch + data:validate first)
```

### Routes

- `/states`, `/states/[stateSlug]`
- `/states/[stateSlug]/counties`, `/states/[stateSlug]/cities`
- `/states/[stateSlug]/college-roi`, `/states/[stateSlug]/federal-spending`, `/states/[stateSlug]/recession-radar`
- `/counties`, `/counties/[stateSlug]/[countySlug]`
- `/metros`, `/metros/[metroSlug]`
- `/rankings/best-local-economies`
- `/rankings/fastest-growing-counties`
- `/rankings/highest-income-counties`
- `/rankings/most-affordable-college-states`
- `/rankings/federal-spending-per-capita`

The static export prebuilds every state route, every state module route, major metros, and the largest county pages. The long county tail is available in `/data/processed/counties.json` and per-state files under `/data/processed/states/`.

---

## Deployment

### Cloudflare Pages

1. Create a Cloudflare Pages project named `localledger`
2. Add GitHub repository secrets:
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages Edit permission
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
   - `FRED_API_KEY` - (optional) FRED API key
   - `CENSUS_API_KEY` - (optional) Census API key
   - `COLLEGE_SCORECARD_API_KEY` - (optional) College Scorecard API key
   - `BEA_API_KEY` - (optional) BEA API key

Secret setup commands:

```bash
printf '%s' '<fred-key>' | gh secret set FRED_API_KEY --repo PandaXPanther/localledger
printf '%s' '<census-key>' | gh secret set CENSUS_API_KEY --repo PandaXPanther/localledger
printf '%s' '<scorecard-key>' | gh secret set COLLEGE_SCORECARD_API_KEY --repo PandaXPanther/localledger
printf '%s' '<bea-key>' | gh secret set BEA_API_KEY --repo PandaXPanther/localledger
```

Push to `main` to trigger automatic deployment.

---

## Methodology

### Local Economy Score (0-100)

Weighted composite of five dimensions (weights must sum to 100):

| Dimension | Weight | Normalization |
|---|---|---|
| Labor | 30% | Unemployment + LFPR, normalized 0-100 |
| Income | 25% | Median HH income vs. CO median |
| Affordability | 20% | Home price-to-income ratio |
| Population Growth | 15% | YoY growth rate |
| Fiscal | 10% | Federal spending per capita |

Missing data reduces effective weight proportionally.

### Slowdown Risk Indicator

Educational model based on CO vs. US unemployment differential (FRED data).
- Score 0-33 = Low
- Score 34-66 = Moderate
- Score 67-100 = Elevated

**Not financial advice. Not investment advice. Not a guaranteed forecast.**

See `/methodology/` for full documentation.

---

## License

MIT - source code. Data from official public sources; check each source's terms of use.

Computed scores (Local Economy Score, Value Score, Slowdown Risk Indicator) are educational tools only.
