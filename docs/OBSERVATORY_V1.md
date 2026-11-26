# Observatory projection · tatd.observatory.v1

The main Observatory is `/desk`. Existing deep links continue to serve the historical projection. They do not certify the current Genesis run.

## WO-016D producer handoff

The normative consumer schema is [lib/observatory-v1.ts](../lib/observatory-v1.ts). Publish a single sanitized JSON object produced from an internally consistent read transaction. Use UTC timestamps and the producer's full Git revision. Send atomic full snapshots so session changes replace the prior state. Use stable public IDs for records and a fresh session ID on restart. The browser requests the same-origin `GET /api/observatory` immediately and every 15 seconds after a request completes.

| Section | Producer source and mapping |
| --- | --- |
| Session | Runtime run record and verified heartbeat. Map admitted paper sessions to ACTIVE and persisted terminal outcomes to COMPLETED or FAILED. Use STANDBY for an explicitly verified waiting state. Supply 21600 seconds for a six-hour run. Report elapsed seconds as of the heartbeat. |
| Instances | Published per-instance observation, decision, budget and activity records. Include an independent heartbeat for activity motion. Model names and summaries require publication approval. |
| Economy | Canonical Genesis accounting and paper ledger. Amounts are integer USD cents. Drawdown uses basis points. Omit unavailable values. |
| Market | WO-016D shared observer feed. Publish finalized launch and graduation records, and label measured spot enrichment separately. Size-specific quote availability requires independent scoped quote evidence. |
| Execution | Publish decisions, Authority/Grant/reservation events, M04 simulated receipts and reconciliation. ENTRY, EXIT and FILL require both M04 and a public receipt ID. |
| ESGE | Derive OBSERVED from persisted observations, HYPOTHESIZED from an independent hypothesis and prediction, TESTED from an experiment with reported outcome, REVISED from an explicitly recorded hypothesis revision. Preserve hypothesis linkage and contradictory outcomes. Append-only experience capture alone establishes event history. |
| Infrastructure | Per-provider probe records, timestamps and qualification state. Quota, when publishable, is a remaining request count. |

Publish only public-safe summaries and IDs. The producer must allowlist fields and redact content before transport. The consumer rejects unknown fields, malformed data, duplicate records and events after publication. Display values form an additional defensive filter. The producer is responsible for review of free text, classification, and source records.

## Transport and freshness

- Connected mode accepts a configured HTTPS GET endpoint with a read-only bearer token kept in server environment variables `OBSERVATORY_PROJECTION_READ_URL` and `OBSERVATORY_PROJECTION_READ_TOKEN`. Configure both only after the publisher is authorized. The endpoint must return an `application/json` object no larger than 128,000 bytes. Redirects fail closed. The token must have read scope on the sanitized projection alone. Neither runtime admission nor worker custody belongs to Vercel.
- Static mode reads a reviewed `public/data/observatory-v1.json` and exact SHA-256 hex digest in `public/data/observatory-v1.sha256`. Digest checks attest byte integrity. The Git review and publisher establish provenance. Older snapshots remain historical and show publication time without ticking the runtime clock.
- Missing, invalid, interrupted, and stale inputs render unavailable. Connected publication and active heartbeat must be at most 120 seconds old. Active status expires at the scheduled end until a terminal record arrives. Provider and instance timestamps age independently. A subsequent valid response replaces the error state on the next polling cycle.
- Test fixtures are injected by Playwright through route interception and are never served by the application. The production default without approved artifacts or endpoint configuration is UNAVAILABLE.

The public consumer and fixture contract were developed against WO-016C merge `422540a526ebd4449dfb9eff8f6bd56626322afd` and WO-016D draft head `7564809dc894ad6d672474b09b58f45d8ceba8b6`. The data plane still requires a reviewed producer/exporter binding before it can display a verified session.
