# Deployment

The observatory is a static-first Next.js app. It ships as a build plus a
generated projection file; there is no runtime database or secret to configure.

## Prerequisites

- Node.js 20+
- Python 3.11+ (only to regenerate the projection snapshot)
- The private runtime database, if you are producing a fresh snapshot

## 1. Generate the projection snapshot

Run from the repository root. The exporter needs the private runtime, so point
`--config`, `--research` and `--evidence` at the private checkout as well:

```bash
python3 -m public_projection \
  --db <path-to-runtime.sqlite3> \
  --config <path-to-config.json> \
  --research <path-to-research-runs> \
  --evidence <path-to-evidence> \
  --out public/data
```

This writes `public/data/snapshot.json` and `manifest.json`. The
exporter opens the private database read-only and publishes only allowlisted
fields. If you do not have the database, copy an existing snapshot — but never
hand-edit published values to make a page look better.

## 2. Build

```bash
npm ci
npm run build
```

`next.config.ts` traces `public/data/**/*.json` into the build output, so the
snapshot is available to the server-rendered pages.

## 3. Verify before deploying

```bash
npm run typecheck     # tsc --noEmit
npm run test:unit     # contract tests against the published snapshot
npm run test:e2e      # Playwright smoke suite (desktop + mobile)
```

All three must pass. The contract suite is the security gate; a failure there
means the projection is publishing something it should not.

## 4. Deploy to Vercel

- Project root: repository root
- Framework preset: Next.js
- Build command: `npm run build`
- Output: `.next`
- Environment variables: none required for the site itself

The app is static-first; no server secrets are needed. If you later add a
`CONNECTED` read API, keep its credentials server-side only and never expose
them to the browser bundle.

## 5. Post-deploy checks

1. Load `/` and confirm the hero, all narrative sections, and the evidence
   cards render.
2. Confirm every `/desk`, `/explorer`, `/economy`, `/research`, `/system`,
   `/treasury`, `/docs` route responds.
3. Confirm response headers include the CSP from `next.config.ts`.
4. Confirm the published snapshot digest in `manifest.json` matches the file
   you intended to ship.

## Rollback

Deployments are immutable on Vercel. Roll back by promoting the previous
deployment. Because the site is static, a rollback also reverts the published
snapshot — so re-check the digest after rolling back.
