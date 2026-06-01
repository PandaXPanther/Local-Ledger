# LocalLedger

Official public economic data, turned into readable local dashboards.

[Live site](local-ledger.net)

[![Build and deploy](https://github.com/PandaXPanther/localledger/actions/workflows/deploy.yml/badge.svg)](https://github.com/PandaXPanther/localledger/actions/workflows/deploy.yml)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-f38020.svg)](https://localledger.pages.dev)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20TypeScript%20%2B%20Tailwind-111827.svg)

<p align="center">
  <a href="https://localledger.pages.dev">
    <img src="./branding/localledger-logo.svg" alt="LocalLedger logo" width="360">
  </a>
</p>

## What It Is

LocalLedger is a public economic intelligence site for communities, students, journalists, local builders, and civic researchers. It turns official labor, income, housing, education, GDP, and federal spending datasets into static dashboards with source metadata attached to every displayed metric.

The current release covers every U.S. state, national rankings, Colorado state pages, major Colorado city pages, county tables, college ROI pages, federal spending pages, and static JSON data exports.

## Features

- State dashboards with unemployment, income, population, GDP, federal spending, and composite local economy scores.
- Colorado deep dives for Denver, Boulder, Colorado Springs, Fort Collins, Aurora, counties, college ROI, recession radar, and federal spending.
- National rankings for local economy score, county growth, county income, college affordability, and federal spending per capita.
- Static JSON API under `/data/processed/` for downstream analysis.
- Data validation that fails the build when source metadata is missing or production data looks fabricated.
- Static export optimized for Cloudflare Pages.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Tests | Jest |
| Package manager | pnpm 9 |
| Hosting | Cloudflare Pages |
| CI | GitHub Actions |

## Data Sources

LocalLedger uses official public data sources only.

| Source | Used for |
|---|---|
| [FRED, Federal Reserve Economic Data](https://fred.stlouisfed.org/) | Unemployment, population, GDP, selected national comparisons |
| [U.S. Census Bureau ACS](https://www.census.gov/programs-surveys/acs) | Population, household income, housing values, counties, places |
| [Bureau of Economic Analysis](https://www.bea.gov/) | Regional state account cross checks |
| [College Scorecard](https://collegescorecard.ed.gov/) | Net price, graduation, earnings, debt |
| [USAspending.gov](https://www.usaspending.gov/) | Federal award spending by geography |

## Data Integrity Rules

1. Official public sources only.
2. No AI generated or invented numeric values.
3. Missing source values display as `Data unavailable`.
4. Every metric object must include source name, source URL, dataset, geography, date, and fetch timestamp.
5. Computed scores must include methodology notes.
6. `pnpm data:validate` fails on missing metadata, invalid numeric values, and mock data strings.
7. `pnpm data:sanity` fails the build if homepage or Colorado page KPIs go null while source data succeeded.
8. `pnpm lint:unicode` fails if U+2014 appears in checked source paths.

## Local Development

```bash
git clone https://github.com/PandaXPanther/localledger.git
cd localledger
pnpm install
pnpm data:fetch
pnpm data:validate
pnpm data:sanity
pnpm dev
```

Production verification:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Environment Variables

Create `.env.local` for local data fetches. Values are secrets and should never be committed.

```env
FRED_API_KEY=
CENSUS_API_KEY=
COLLEGE_SCORECARD_API_KEY=
BEA_API_KEY=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

## Deployment

The GitHub Actions workflow fetches official data, validates processed JSON, checks build sanity, runs typecheck, lint, tests, builds a static export, then deploys `out/` to Cloudflare Pages.

Production: https://localledger.pages.dev

Cloudflare Pages project: `localledger`

## Methodology

Score formulas, risk indicators, validation policy, and source handling are documented on the live methodology page:

[Read the methodology](https://localledger.pages.dev/methodology/)

## Branding

Committed brand assets:

- `branding/localledger-logo.svg`
- `branding/localledger-logo.png`
- `branding/localledger-logo-1024.png`
- `branding/localledger-favicon-source.svg`
- `branding/localledger-social.png`

GitHub social preview can be set in repo settings using `branding/localledger-social.png`.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md), open an issue for meaningful behavior changes, and keep data provenance intact in every PR.

## Security

Please report security issues through GitHub Security Advisories or by email to `pandaxpanther@gmail.com`. See [SECURITY.md](./SECURITY.md).

## License

MIT. See [LICENSE](./LICENSE).

Public datasets remain governed by their source agencies and published terms.

## Credits

Founded and built by [Saras Totey](https://www.linkedin.com/in/saras-totey-64a777334/).

Founder site: [econ.mom](https://econ.mom)

## GitHub About Box

Suggested description:

`Official public economic data, turned into readable local dashboards.`

Website:

`https://localledger.pages.dev`

Suggested topics:

`economics`, `public-data`, `dashboard`, `nextjs`, `typescript`, `tailwindcss`, `cloudflare-pages`, `census`, `fred`, `usaspending`, `college-scorecard`
