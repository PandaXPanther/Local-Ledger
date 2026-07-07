# LocalLedger Project Brain

> Source of truth for LocalLedger. Agents should read and update this file when the project state changes.

## 30-second TLDR

LocalLedger turns official labor, income, housing, education, and federal spending data into readable, cited local dashboards, and pairs them with an interactive economy simulator (41 dials, 12 historical scenarios) for economics education.

## Current Status

- Phase: Simulator live, original brand restored
- Last update: 2026-07-07
- Owner: Saras Totey
- Repo: https://github.com/PandaXPanther/localledger
- Production: https://localledger.pages.dev
- Hosting: Cloudflare Pages

## Implemented Routes

- `/`
- `/simulator`
- `/colorado`
- `/colorado/denver`
- `/colorado/boulder`
- `/colorado/colorado-springs`
- `/colorado/fort-collins`
- `/colorado/aurora`
- `/colorado/counties`
- `/colorado/college-roi`
- `/colorado/federal-spending`
- `/colorado/recession-radar`
- `/methodology`
- `/sources`
- `/api`
- `/about`
- `/states`
- `/states/[stateSlug]`
- `/states/[stateSlug]/counties`
- `/states/[stateSlug]/cities`
- `/states/[stateSlug]/college-roi`
- `/states/[stateSlug]/federal-spending`
- `/states/[stateSlug]/recession-radar`
- `/counties`
- `/counties/[stateSlug]/[countySlug]`
- `/metros`
- `/metros/[metroSlug]`
- `/rankings`
- `/rankings/best-local-economies`
- `/rankings/fastest-growing-counties`
- `/rankings/highest-income-counties`
- `/rankings/most-affordable-college-states`
- `/rankings/federal-spending-per-capita`

## Data Integrity

- Official public sources only.
- Missing values display `Data unavailable`.
- Every metric object requires source metadata, date, and last fetched timestamp.
- Computed scores require methodology notes.
- `pnpm data:validate` fails on missing metadata, invalid values, and production data strings that imply mock or invented data.

## Deployment

GitHub Actions runs:

```bash
pnpm refresh-data
pnpm typecheck
pnpm lint
pnpm test
pnpm build
wrangler pages deploy out --project-name=localledger
```

Required GitHub secrets are configured for:

- `FRED_API_KEY`
- `CENSUS_API_KEY`
- `COLLEGE_SCORECARD_API_KEY`
- `BEA_API_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Decision Log

### 2026-06-01

- Built the Colorado MVP as a static-export Next.js app for Cloudflare Pages.
- Added SEO metadata, JSON-LD, sitemap, robots, source pages, methodology pages, API catalog, and founder page.
- Added national foundations with `/states` and `/rankings`.
- Added data fetch and validation scripts with official-source provenance rules.

### 2026-06-01 02:35 UTC

- Expanded LocalLedger from Colorado MVP to national static platform.
- Added official API fetches with raw cache files, source attempt logs, retries, and per-source success counts.
- Added logo/favicons/OG image, slim Explore nav, search index, national state/county/metro routes, and ranking routes.
- Static export prebuilds states, state modules, major metros, and top counties; full county long tail is published as static JSON.

### 2026-06-01 03:15 UTC

- Reworked the hero pulse panel so source cards show real build data instead of decorative empty rectangles.
- Added build sanity checks for homepage and Colorado KPIs plus a CI Unicode guard for U+2014.
- Prepared public repo materials: README, license, security, contributing, code of conduct, issue templates, PR template, and branding assets.

### 2026-06-01 03:55 UTC

- Added econ.mom as Saras Totey's primary site and LocalLedger sister project on the About page.
- Added footer, metadata, and JSON-LD references that connect LocalLedger with econ.mom without changing canonical URLs.

### 2026-06-01 18:37 UTC

- Split normal builds from API data refreshes. `pnpm build` validates existing processed data without refetching, and `pnpm refresh-data` performs the explicit API refresh plus validation.

### 2026-07-07

- Shipped the economy simulator ("the Machine") as the flagship feature at `/simulator`: a deterministic quarterly macro model in `src/lib/sim/` (engine, 41 param definitions with educational notes, 12 presets, jest suite that asserts the economics), a client control-room UI with live dials, recharts dashboards, event log, and ticker, plus server-rendered mechanism and dial documentation for SEO.
- Full brand rework: new conceptual hook ("real data upstairs, a crash-test economy downstairs"), Fraunces + Author + JetBrains Mono type stack (Inter removed), machine-orange #E8540A accent on ledger cream, new bracket-and-spark logo with regenerated favicon/OG assets (`tools/generate_brand_assets.py`), and logo geometry deconstructed into site chrome (hud-frame corners, ledger ruling, spark hero animation).
- Repositioned metadata, homepage, About, and README around economics education. Added simulator JSON-LD (SoftwareApplication + LearningResource) and sitemap entry at priority 0.95.
- Simulated numbers are confined to `/simulator` and labeled; the data-integrity rules for real metrics are unchanged.

### 2026-07-07 (later)

- Reverted the brand rework. Restored the original design: paper cream background, forest green #23684A accent, Source Serif 4 + Inter + JetBrains Mono type stack, pill buttons, original green logo and favicon set. Deleted the bracket-and-spark assets, `BrandLogo.tsx`, and `branding/BRAND.md`.
- Kept the simulator intact and rethemed its UI from the dark machine-room look to the original light palette. Dropped "the Machine" naming in favor of plain "economy simulator". Homepage now shows the simulator as a light section on the original layout.
- Rewrote site copy in plainer language: shorter sentences, no marketing voice. Mechanism explanations on the simulator page simplified.
