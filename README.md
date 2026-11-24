# -IV

Building a token-funded autonomous trading desk. Four AI agents. On-chain
intelligence. Memetic research. Risk-gated execution. $IV

This repository holds the public observatory only — the read-only Next.js
frontend for the Tokenized Autonomous Trading Desk (TATD). It renders a
sanitized public projection of the private paper runtime. It never connects to
the trading database, the signer or provider credentials. The private runtime
lives in a separate, private repository.

## Quick start

```bash
npm install
npm run dev
```

The app reads `public/data/snapshot.json`. Generate it from the repository root:

```bash
python3 -m public_projection --db <path-to-runtime.sqlite3> --out public/data
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run test:unit` | Node unit tests for formatting and contract helpers |
| `npm run test:e2e` | Playwright E2E tests |

## Data modes

- `SNAPSHOT` — reads a static, sanitized bundle. Default.
- `CONNECTED` — reads a qualified external projection. Not implemented in this repository.
- `UNAVAILABLE` — renders explicit unavailable states.

The public site never triggers paid provider calls. All refreshes are served from
the projection file or the connected read API.

## Security boundary

- No wallet connection.
- No signing capability.
- No provider credentials in the client bundle.
- No mutation endpoints.
- Allowlisted public fields only.
- Private keys, mnemonics, raw prompts and full model inputs are never projected.

See `docs/SECURITY_BOUNDARY.md`.

## Deployment

See `docs/DEPLOYMENT.md`. The Vercel project should point its root directory at
the repository root.
