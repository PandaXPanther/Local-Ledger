# AGENTS.md

## First Action

1. Read `PROJECT.md`.
2. Check the latest Decision Log entry.
3. Run `git status --short` before editing.

## Project Rules

- Use Next.js App Router, TypeScript, and Tailwind.
- Keep the app compatible with static export for Cloudflare Pages.
- Do not commit secrets.
- Do not fabricate metric values. If a value cannot be fetched and cited, show `Data unavailable`.
- Every displayed metric needs source metadata, date, last fetched timestamp, and a methodology note when computed.
- Do not use em dashes in public copy, README, metadata, or source content.

## Verification

Before pushing, run:

```bash
pnpm data:fetch
pnpm data:validate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Deployment

Cloudflare Pages project name: `localledger`.

GitHub Actions deploys `out` with Wrangler after the full validation and build pipeline passes.
