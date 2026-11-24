# Security Boundary

The public observatory is a read-only presentation layer. It never talks to the
private trading runtime, holds no credentials, and cannot move funds. This
document states the boundary precisely so it can be audited.

## Trust boundary

```
private runtime  ──►  public_projection (exporter)  ──►  snapshot.json  ──►  web app
   (database)            allowlist + sanitize            static file        read-only
```

The web application consumes exactly one artefact: `public/data/snapshot.json`
(plus `manifest.json` for its digest). It has no database driver, no RPC client,
and no signing library. See `public_projection/` for the exporter.

## What the exporter publishes

Only allowlisted fields reach the bundle. Everything else is dropped at
projection time, not hidden at render time — so an unrendered field cannot leak
through a future component.

Never published:

- API keys, tokens, mnemonics, private keys (`OPENROUTER_API_KEY`,
  `BITQUERY_API_KEY`, `VIRLO_API_KEY`, `WALLET_PRIVATE_KEY`, `WALLET_MNEMONIC`).
- Raw model prompts, raw model outputs, provider receipts.
- Custody data and unmasked wallet addresses (addresses are truncated unless the
  publication policy explicitly opts in).
- Any field not on the allowlist.

The contract tests in `tests/unit/contract.test.mjs` enforce this against the
published file, so a regression fails the build rather than shipping.

## No signing authority

The site renders execution state; it cannot create it. There is no wallet
connection, no transaction builder, and no signing capability in the browser
bundle. Every "action" shown is a historical record of something the private
runtime already did.

## No mutation endpoints

All routes are read-only. `app/api/public/[...path]/route.ts` serves GET reads
from the projection; there is no POST/PUT/PATCH/DELETE handler. The landing page
and every observatory surface only read.

## HTTP security headers

Set in `next.config.ts` for every path:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

`poweredByHeader` is disabled so the framework version is not advertised.

## Data modes

- `SNAPSHOT` — static projection file. Default and only mode implemented here.
- `CONNECTED` — reserved for a qualified read API. Not implemented.
- `UNAVAILABLE` — explicit unavailable states, never fabricated activity.

Missing observations are labelled unavailable. The projection does not invent
counters, placeholder balances, or synthetic live feeds.

## Reporting

A suspected leak should be treated as a projection bug: fix the exporter
allowlist, regenerate the snapshot, and re-run `npm run test:unit` (the contract
suite) before redeploying.
