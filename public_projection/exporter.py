"""Build the sanitized public snapshot for the TATD observatory.

The exporter opens the private trading database read-only and reuses the
existing read models (``read_view`` and ``funding_view``). It publishes only
explicitly allowlisted fields. Raw model prompts, raw outputs, receipts,
credentials, custody data and unmasked wallet addresses never enter the bundle.
"""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path

from .contracts import (
    AGENTS,
    EVENT_MAP,
    MEMETIC_SCANNERS,
    SCANNER_PROFILES,
    SCANNERS,
    SCHEMA_VERSION,
)
from .policy import PublicationPolicy
from .sanitize import clean_text, freshness, iso, safe_int

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_RESEARCH = ROOT / "tatd-research" / "runs"
DEFAULT_EVIDENCE = ROOT / "evidence"

AGENT_EVENT_KINDS = {
    "M01": ("model_scout",),
    "M02": ("model_narrative",),
    "M03": ("model_health",),
    "M04": ("model_trade", "model_treasury", "trade_decision", "treasury_decision"),
}

AGENT_PROVIDERS = {
    "M01": ("DeepSeek", "DEX Screener", "Bitquery"),
    "M02": ("Virlo", "X Intelligence", "News Intelligence"),
    "M03": ("DEX Screener", "Own token market data"),
    "M04": ("Groundhog 1", "Bison 1"),
}

# Keys that must never be published. Applied recursively to model payloads.
FORBIDDEN_KEYS = frozenset(
    {
        "request",
        "messages",
        "raw_output",
        "receipt",
        "prompt",
        "system",
        "api_key",
        "apikey",
        "authorization",
        "secret",
        "private_key",
        "mnemonic",
        "seed_phrase",
        "signer",
        "custody",
        "signature",
        "signed_transaction",
        "raw_transaction",
        "developer_address",
    }
)


def _load(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _strip(value, policy):
    """Recursively drop forbidden keys and bound text values."""
    if isinstance(value, dict):
        return {key: _strip(item, policy) for key, item in value.items() if key not in FORBIDDEN_KEYS}
    if isinstance(value, list):
        return [_strip(item, policy) for item in value]
    if isinstance(value, str):
        return clean_text(value, policy)
    return value


def _desk(db_path, config_path):
    from tatd.engine import Desk

    return Desk(db_path, _load(config_path))


def _view(desk, route):
    from tatd.__main__ import read_view

    try:
        return read_view(desk, route).get("data") or {}
    except Exception:  # noqa: BLE001 - projection must degrade, not fail
        return {}


def _funding(desk):
    import sqlite3

    from tatd.funding import funding_view

    connection = sqlite3.connect(f"file:{Path(desk.path).resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    try:
        return funding_view(connection, desk.funding)
    except Exception:  # noqa: BLE001
        return {}
    finally:
        connection.close()


def _states(desk):
    """Read research_states without importing a private query helper."""
    import sqlite3

    connection = sqlite3.connect(f"file:{Path(desk.path).resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    states = {}
    try:
        for row in connection.execute("SELECT domain, body FROM research_states"):
            try:
                body = json.loads(row["body"])
            except (TypeError, ValueError):
                continue
            states[row["domain"]] = body.get("data", body) if isinstance(body, dict) else {}
    except sqlite3.Error:
        pass
    finally:
        connection.close()
    return states


def _snapshots(desk):
    import sqlite3

    connection = sqlite3.connect(f"file:{Path(desk.path).resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    snapshots = []
    try:
        for row in connection.execute("SELECT id, observed_at, body FROM snapshots ORDER BY observed_at"):
            try:
                body = json.loads(row["body"])
            except (TypeError, ValueError):
                continue
            snapshots.append({"id": row["id"], "observed_at": row["observed_at"], **body})
    except sqlite3.Error:
        pass
    finally:
        connection.close()
    return snapshots


def _events(desk):
    import sqlite3

    connection = sqlite3.connect(f"file:{Path(desk.path).resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    events = []
    try:
        for row in connection.execute("SELECT id, observed_at, snapshot_id, kind, body FROM events ORDER BY id"):
            try:
                body = json.loads(row["body"])
            except (TypeError, ValueError):
                body = {}
            events.append(
                {
                    "id": row["id"],
                    "observed_at": row["observed_at"],
                    "snapshot_id": row["snapshot_id"],
                    "kind": row["kind"],
                    "body": body,
                }
            )
    except sqlite3.Error:
        pass
    finally:
        connection.close()
    return events


def _overview(desk, funding, snapshots, policy):
    view = _view(desk, "overview")
    paper = funding.get("paper_accounting") or {}
    open_positions = view.get("open_positions") or []
    unrealized = None
    if open_positions:
        marks = [position.get("mark_price_usd") for position in open_positions]
        if all(mark is not None for mark in marks):
            from decimal import Decimal, InvalidOperation

            total = Decimal(0)
            try:
                for position, mark in zip(open_positions, marks):
                    entry_price = Decimal(str(position.get("entry_price") or "0"))
                    entry_cents = Decimal(str(position.get("entry_cents") or 0))
                    if entry_price <= 0:
                        raise InvalidOperation
                    quantity = entry_cents / entry_price
                    total += quantity * Decimal(str(mark)) - entry_cents
                unrealized = int(total)
            except (InvalidOperation, ValueError, ArithmeticError):
                unrealized = None
    notes = []
    if unrealized is None:
        notes.append("Unrealized PnL is unavailable because no mark price was observed for every open position.")
    credits = funding.get("provider_credits") or {}
    if credits.get("remaining_micros") is None:
        notes.append("Intelligence expenditure is unavailable: no provider credit observation was recorded.")
    if credits.get("runway_days") is None:
        notes.append("Operational runway is unavailable: no funded provider balance was observed.")
    observed = snapshots[-1].get("observed_at") if snapshots else None
    return {
        "operating_capital_cents": safe_int(view.get("wallet_1_cents")),
        "profit_treasury_cents": safe_int(view.get("wallet_2_cents")),
        "realized_pnl_cents": safe_int((view.get("realized_pnl") or {}).get("total_cents")),
        "unrealized_pnl_cents": unrealized,
        "creator_fees_cents": safe_int(paper.get("gross_creator_fees_cents")),
        "open_positions": len(open_positions),
        "intelligence_expenditure_cents": None,
        "operational_runway_days": credits.get("runway_days"),
        "notes": notes,
        "observed_at": iso(observed),
        "data_quality": "SYNTHETIC_DEMO" if (snapshots[-1].get("source") == "synthetic-demo" if snapshots else False) else "RUNTIME",
        "trading_balance_cents": safe_int(paper.get("trading_balance_cents")),
        "operational_balance_cents": safe_int(paper.get("operational_balance_cents")),
        "intelligence_available_cents": safe_int(paper.get("intelligence_available_cents")),
        "open_position_records": [
            {
                "token": position.get("token"),
                "pair_id": position.get("pair_id"),
                "entry_price": position.get("entry_price"),
                "entry_cents": position.get("entry_cents"),
                "mark_price_usd": position.get("mark_price_usd"),
                "entry_at": iso(position.get("entry_at")),
            }
            for position in open_positions
        ],
    }


def _agents(desk, events, policy):
    view = _view(desk, "agents")
    configured = view.get("configured_models") or {}
    latest = view.get("latest_outputs") or {}
    by_kind = {}
    for event in reversed(events):
        by_kind.setdefault(event.get("kind"), event)
    agents = []
    for agent in AGENTS:
        kinds = AGENT_EVENT_KINDS.get(agent["id"], ())
        event = next((by_kind[kind] for kind in kinds if kind in by_kind), None)
        model = configured.get(agent["model_key"]) or configured.get("groundhog")
        agents.append(
            {
                "id": agent["id"],
                "name": agent["name"],
                "role": agent["role"],
                "responsibility": agent["responsibility"],
                "color": agent["color"],
                "glyph": agent["glyph"],
                "configured_model": model,
                "qualification_state": "EXPLORATORY",
                "runtime_state": "IDLE" if event else "UNKNOWN",
                "href": agent["route"],
                "provider_dependencies": list(AGENT_PROVIDERS.get(agent["id"], ())),
                "last_observed": iso(event.get("observed_at")) if event else None,
                "latest_output_summary": _summary(event, policy),
            }
        )
    return agents


def _summary(event, policy):
    if not event:
        return None
    kind = event.get("kind") or ""
    body = event.get("body") or {}
    money = lambda cents: f"${(cents or 0) / 100:,.2f}"
    if kind == "protocol_fee":
        return f"Creator fee credited: {money(body.get('cents'))}"
    if kind == "fee.allocated":
        return (
            f"Fee split 20/80 — developer {money(body.get('developer'))}, "
            f"operating {money(body.get('trading'))}, intelligence {money(body.get('intelligence'))}, "
            f"operational {money(body.get('operational'))}"
        )
    if kind == "model_narrative":
        return "Narrative clusters observed"
    if kind == "model_health":
        output = body.get("output") or {}
        return f"Own-token health: {output.get('phase', 'unknown')} (score {output.get('score', '—')})"
    if kind == "scanner_prefilter":
        return f"Scanner prefilter: {len(body.get('candidate_ids') or [])} candidate(s)"
    if kind == "model_scout":
        output = body.get("output") or {}
        return f"Scout qualified {len(output.get('candidates') or [])} candidate(s)"
    if kind == "model_trade":
        output = body.get("output") or {}
        return f"Decision model proposed {output.get('action', '—')} (confidence {output.get('confidence', '—')})"
    if kind == "model_treasury":
        output = body.get("output") or {}
        return f"Treasury model proposed {output.get('action', '—')} (confidence {output.get('confidence', '—')})"
    if kind == "trade_decision":
        decision = body.get("decision") or {}
        return f"Trade decision: {decision.get('action', '—')} ({body.get('outcome', '—')})"
    if kind == "treasury_decision":
        decision = body.get("decision") or {}
        return f"Treasury decision: {decision.get('action', 'hold')} ({body.get('status', '—')})"
    if kind == "scan_complete":
        return (
            f"Scan completed: {body.get('candidate_count', 0)} candidate(s), "
            f"{body.get('decisions', 0)} decision(s), {body.get('closed_positions', 0)} closed"
        )
    if kind == "trade_exit":
        return f"Position closed: {body.get('reason', 'exit')} PnL {money(body.get('pnl_cents'))}"
    output = body.get("output")
    if isinstance(output, dict):
        text = json.dumps(_strip(output, policy), sort_keys=True)
        return text[:280]
    return clean_text(body.get("reason") or body.get("status") or kind, policy, limit=280)


def _events_public(events, snapshots, policy):
    by_id = {snapshot.get("id"): snapshot for snapshot in snapshots}
    public = []
    for event in events:
        kind = event.get("kind") or ""
        mapping = EVENT_MAP.get(kind)
        if not mapping:
            continue
        event_type, family = mapping
        snapshot = by_id.get(event.get("snapshot_id")) or {}
        body = event.get("body") or {}
        summary = _summary(event, policy) or event_type
        public.append(
            {
                "event_id": str(event.get("id")),
                "event_type": event_type,
                "family": family,
                "source": "runtime",
                "occurred_at": iso(event.get("observed_at")),
                "published_at": iso(event.get("observed_at")),
                "mode": "PAPER",
                "evidence_state": "INFERRED" if kind.startswith("model_") else "OBSERVED",
                "source_class": "SYNTHETIC_DEMO" if snapshot.get("source") == "synthetic-demo" else "RUNTIME",
                "summary": summary,
                "related": _related(event, body),
            }
        )
    return public


def _related(event, body):
    related = []
    for key in ("id", "pair_id", "token", "mint", "narrative_id", "decision_id"):
        value = body.get(key)
        if isinstance(value, str):
            related.append(value)
    return related


def _market(desk, snapshots, policy):
    candidates = []
    for snapshot in snapshots:
        for pair in snapshot.get("pairs") or []:
            candidates.append(
                {
                    "token": pair.get("token"),
                    "mint": pair.get("mint"),
                    "pool": pair.get("pool") or pair.get("id"),
                    "age_seconds": pair.get("age_seconds"),
                    "market_cap": pair.get("market_cap"),
                    "liquidity": pair.get("liquidity"),
                    "volume": pair.get("volume"),
                    "buy_sell": pair.get("buy_sell"),
                    "unique_wallets": pair.get("unique_wallets"),
                    "scanner": pair.get("scanner"),
                    "narrative_match": pair.get("narrative_match"),
                    "integrity_verdict": pair.get("integrity_verdict") or "UNKNOWN",
                    "decision_status": pair.get("decision_status") or "OBSERVED",
                    "observed_at": iso(snapshot.get("observed_at")),
                }
            )
    scanners = []
    for scanner in SCANNERS:
        scanners.append(
            {
                "id": scanner["id"],
                "code": scanner["id"],
                "name": scanner["name"],
                "purpose": scanner["description"],
                "activation": "SHADOW",
                "qualification": "EXPLORATORY",
                "configuration_version": "scanner-profiles-v1",
                "recent_signals": None,
                "missing_features": [],
                "profiles": [
                    {"id": profile["id"], "name": profile["name"], "activation": "SHADOW"}
                    for profile in SCANNER_PROFILES
                ],
            }
        )
    return {
        "scanners": scanners,
        "candidates": candidates,
        "activation": "SHADOW",
        "qualification": "EXPLORATORY",
    }


def _memetic(states, evidence, policy):
    narratives = []
    source = states.get("narrative") or {}
    raw = source.get("narratives") or {}
    if isinstance(raw, dict):
        items = [{"id": key, **value} for key, value in raw.items() if isinstance(value, dict)]
    else:
        items = raw if isinstance(raw, list) else []
    for narrative in items:
        matrix = narrative.get("baseline_narrative_matrix") or {}
        narratives.append(
            {
                "id": narrative.get("narrative_id") or narrative.get("id"),
                "canonical": narrative.get("narrative_id") or narrative.get("id"),
                "taxonomy": narrative.get("origin_type") or "UNKNOWN",
                "aliases": narrative.get("aliases") or [],
                "detected_at": narrative.get("detected_at"),
                "sources": [ref.get("platform") for ref in narrative.get("source_references") or [] if ref.get("platform")],
                "lifecycle": narrative.get("lifecycle") or "UNKNOWN",
                "memetic_score": matrix.get("weighted_score"),
                "score_bounds": "0-100",
                "evidence_coverage": narrative.get("source_quality", {}).get("integrity_status") or "UNKNOWN",
                "attention_integrity": narrative.get("source_quality", {}).get("integrity_status") or "UNKNOWN",
                "saturation_risk": "UNKNOWN",
                "related_mints": narrative.get("related_mints") or [],
            }
        )
    scanners = []
    for scanner in MEMETIC_SCANNERS:
        scanners.append(
            {
                "id": scanner["id"],
                "code": scanner["id"],
                "name": scanner["name"],
                "purpose": scanner["description"],
                "activation": "SHADOW",
                "qualification": "EXPLORATORY",
                "configuration_version": "memetic-scanners-v1",
                "recent_signals": None,
                "missing_features": [],
                "profiles": [
                    {"id": profile["id"], "name": profile["name"], "activation": "SHADOW"}
                    for profile in SCANNER_PROFILES
                ],
            }
        )
    providers = []
    for provider in evidence.get("providers") or []:
        providers.append(
            {
                "id": provider.get("id"),
                "state": provider.get("state") or "UNVERIFIED",
                "note": clean_text(provider.get("note") or "", policy, limit=200),
            }
        )
    return {
        "narratives": narratives,
        "scanners": scanners,
        "providers": providers,
        "momentum": {"cultural": [], "memetic": [], "financial": []},
    }


def _ecosystem(states, snapshots):
    observed = snapshots[-1] if snapshots else {}
    own = observed.get("own_token") or {}
    history = []
    for snapshot in snapshots:
        own_token_row = snapshot.get("own_token") or {}
        history.append(
            {
                "at": iso(snapshot.get("observed_at")),
                "market_cap": own_token_row.get("market_cap"),
                "liquidity": own_token_row.get("liquidity"),
            }
        )
    health = []
    source = states.get("ecosystem") or {}
    dimensions = source.get("dimensions") or {}
    if isinstance(dimensions, dict):
        for name, value in dimensions.items():
            health.append(
                {
                    "dimension": name,
                    "value": value.get("score") if isinstance(value, dict) else value,
                    "note": "",
                }
            )
    return {
        "own_token": {
            "mint": own.get("mint"),
            "launch_state": "PRE_LAUNCH" if not own.get("mint") else "LAUNCHED",
            "market_cap": own.get("market_cap"),
            "liquidity": own.get("liquidity"),
            "holders": own.get("holders"),
            "creator_fees": own.get("fee_flow_cents"),
            "operating_mode": (source.get("baseline_health") or {}).get("phase") or "UNKNOWN",
        },
        "health": health,
        "history": history,
    }


def _economy(funding, policy):
    paper = funding.get("paper_accounting") or {}
    allocation = paper.get("allocation_cents") or {}
    wallets = [
        {
            "id": "W00",
            "role": "Developer",
            "address": "MASKED",
            "balance_cents": safe_int(paper.get("developer_allocated_cents")),
            "state": "OBSERVED",
            "note": "20% of creator fees",
        },
        {
            "id": "W01",
            "role": "Operating",
            "address": "MASKED",
            "balance_cents": safe_int(paper.get("trading_balance_cents")),
            "state": "OBSERVED",
            "note": "80% of creator fees; trading capital",
        },
        {
            "id": "W01B",
            "role": "Intelligence Payment",
            "address": "MASKED",
            "balance_cents": safe_int(paper.get("intelligence_available_cents")),
            "state": "OBSERVED",
            "note": "Model intelligence reserve",
        },
        {
            "id": "W01C",
            "role": "Operational Payment",
            "address": "MASKED",
            "balance_cents": safe_int(paper.get("operational_balance_cents")),
            "state": "OBSERVED",
            "note": "Operational reserve",
        },
        {
            "id": "W02",
            "role": "Profit Treasury",
            "address": "MASKED",
            "balance_cents": safe_int(paper.get("wallet_2_cents")),
            "state": "OBSERVED",
            "note": "Positive realized net profits",
        },
    ]
    credits = funding.get("provider_credits") or {}
    return {
        "fee_policy": {
            "creator_dev_pct": 20,
            "creator_operating_pct": 80,
            "note": "Existing 20:80 creator fee policy. Operating share is split 70/20/10 by the approved allocation.",
        },
        "allocation": [
            {"domain": "Developer", "pct": 20, "wallet": "W00", "note": "Developer wallet"},
            {"domain": "Trading", "pct": 56, "wallet": "W01", "note": "Trading capital"},
            {"domain": "Model Intelligence", "pct": 16, "wallet": "W01B", "note": "Intelligence reserve"},
            {"domain": "Operational Intelligence", "pct": 8, "wallet": "W01C", "note": "Operational reserve"},
        ],
        "allocation_observed_cents": {
            "developer": safe_int(allocation.get("developer")),
            "trading": safe_int(allocation.get("trading")),
            "intelligence": safe_int(allocation.get("intelligence")),
            "operational": safe_int(allocation.get("operational")),
        },
        "wallets": wallets,
        "transfers": [],
        "prepaid_credits": {
            "status": credits.get("status") or "UNKNOWN",
            "remaining_micros": credits.get("remaining_micros"),
            "runway_days": credits.get("runway_days"),
        },
        "reconciliation": [
            {
                "label": "Paper ledger gross creator fees",
                "value_cents": safe_int(paper.get("gross_creator_fees_cents")),
                "note": "Sum of protocol fee credits",
            },
            {
                "label": "Allocated to trading",
                "value_cents": safe_int(paper.get("trading_balance_cents")),
                "note": "Current trading balance",
            },
        ],
    }


def _treasury(desk):
    view = _view(desk, "treasury")
    decisions = view.get("decisions") or []
    latest = decisions[0] if decisions else {}
    body = latest.get("body") or {}
    decision = body.get("decision") or {}
    actions = []
    for decision_row in decisions:
        row_body = decision_row.get("body") or {}
        row_decision = row_body.get("decision") or {}
        actions.append(
            {
                "id": str(decision_row.get("id")),
                "action": _treasury_action(row_decision.get("action")),
                "amount_cents": safe_int(row_body.get("booked_cents")),
                "state": row_body.get("status") or "UNKNOWN",
                "timestamp": iso(decision_row.get("observed_at")),
            }
        )
    return {
        "available_cents": safe_int(view.get("wallet_2_cents")),
        "recommendation": _treasury_action(decision.get("action")),
        "policy_verdict": "EVALUATED" if decision else "HOLD_RESERVE",
        "actions": actions,
        "automation_paused": bool(view.get("automation_paused")),
    }


def _decisions(events, snapshots, policy):
    """Build linkable decision records with an evidence trail per decision."""
    by_snapshot = {}
    for event in events:
        by_snapshot.setdefault(event.get("snapshot_id"), []).append(event)
    snapshots_by_id = {snapshot.get("id"): snapshot for snapshot in snapshots}
    records = []
    for event in events:
        kind = event.get("kind") or ""
        if kind not in ("trade_decision", "treasury_decision"):
            continue
        body = event.get("body") or {}
        domain = "TRADING" if kind == "trade_decision" else "TREASURY"
        decision = body.get("decision") or {}
        siblings = by_snapshot.get(event.get("snapshot_id")) or []
        model_event = next(
            (
                item
                for item in siblings
                if item.get("kind") == ("model_trade" if domain == "TRADING" else "model_treasury")
            ),
            None,
        )
        model_body = (model_event or {}).get("body") or {}
        snapshot = snapshots_by_id.get(event.get("snapshot_id")) or {}
        outcome = body.get("outcome") or body.get("status") or "UNKNOWN"
        records.append(
            {
                "id": f"decision-{event.get('id')}",
                "domain": domain,
                "timestamp": iso(event.get("observed_at")),
                "model_identifier": model_body.get("model") or "decision-model",
                "routing_reason": body.get("trigger") or "policy",
                "structured_response": _strip(decision, policy),
                "proposed_action": decision.get("action") or "HOLD",
                "policy_verdict": "PASSED" if outcome in ("entry", "paper_allocated", "executed") else "EVALUATED",
                "execution_status": outcome,
                "evidence_references": _related(event, body),
                "outcome": outcome,
                "summary": _summary(event, policy),
                "stages": _stages(event, siblings, snapshot, policy),
            }
        )
    return records


def _stages(event, siblings, snapshot, policy):
    def find(kind):
        return next((item for item in siblings if item.get("kind") == kind), None)

    stages = []
    prefilter = find("scanner_prefilter")
    scout = find("model_scout")
    narrative = find("model_narrative")
    health = find("model_health")
    decision = find("trade_decision") or find("treasury_decision")
    exit_event = find("trade_exit")
    stages.append(
        {
            "id": "discovery",
            "title": "Discovery",
            "description": "Originating scanner or trigger.",
            "timestamp": iso((prefilter or event).get("observed_at")),
            "evidence_state": "OBSERVED" if prefilter else "INFERRED",
            "payload": {"candidate_ids": ((prefilter or {}).get("body") or {}).get("candidate_ids") or []},
        }
    )
    stages.append(
        {
            "id": "market",
            "title": "Market evidence",
            "description": "M01 market data available at decision time.",
            "timestamp": iso((scout or event).get("observed_at")),
            "evidence_state": "OBSERVED" if scout else "UNKNOWN",
            "payload": _strip(((scout or {}).get("body") or {}).get("output") or {}, policy),
        }
    )
    stages.append(
        {
            "id": "narrative",
            "title": "Narrative evidence",
            "description": "M02 observations and interpretations.",
            "timestamp": iso((narrative or event).get("observed_at")),
            "evidence_state": "OBSERVED" if narrative else "UNKNOWN",
            "payload": _strip(((narrative or {}).get("body") or {}).get("output") or {}, policy),
        }
    )
    stages.append(
        {
            "id": "economic",
            "title": "Economic context",
            "description": "M03 system and capital constraints.",
            "timestamp": iso((health or event).get("observed_at")),
            "evidence_state": "OBSERVED" if health else "UNKNOWN",
            "payload": _strip(((health or {}).get("body") or {}).get("output") or {}, policy),
        }
    )
    stages.append(
        {
            "id": "model",
            "title": "Model evaluation",
            "description": "Structured M04 output.",
            "timestamp": iso((decision or event).get("observed_at")),
            "evidence_state": "INFERRED",
            "payload": _strip(((decision or {}).get("body") or {}).get("decision") or {}, policy),
        }
    )
    stages.append(
        {
            "id": "policy",
            "title": "Policy evaluation",
            "description": "Deterministic checks and rejection reasons.",
            "timestamp": iso((decision or event).get("observed_at")),
            "evidence_state": "OBSERVED",
            "payload": {
                "verdict": "PASSED" if ((decision or {}).get("body") or {}).get("outcome") in ("entry", "paper_allocated") else "EVALUATED",
                "status": ((decision or {}).get("body") or {}).get("status"),
            },
        }
    )
    stages.append(
        {
            "id": "execution",
            "title": "Execution",
            "description": "Actual, simulated or rejected action.",
            "timestamp": iso((decision or event).get("observed_at")),
            "evidence_state": "OBSERVED",
            "payload": {"status": ((decision or {}).get("body") or {}).get("outcome") or ((decision or {}).get("body") or {}).get("status")},
        }
    )
    stages.append(
        {
            "id": "outcome",
            "title": "Outcome",
            "description": "Observed trade or treasury result.",
            "timestamp": iso((exit_event or event).get("observed_at")),
            "evidence_state": "OBSERVED" if exit_event else "UNKNOWN",
            "payload": _strip((exit_event or {}).get("body") or {}, policy),
        }
    )
    return stages


def _treasury_action(action):
    mapping = {
        "burn": "BUYBACK_BURN",
        "liquidity": "BUYBACK_LIQUIDITY",
        "airdrop": "HOLDER_AIRDROP",
        "hold": "HOLD_RESERVE",
    }
    return mapping.get(action, "HOLD_RESERVE")


def _research(research_root, evidence, policy):
    runs = []
    for path in _candidate_runs(research_root):
        runs.append(_research_run(path, policy))
    calibration = []
    for item in evidence.get("calibration") or []:
        calibration.append(
            {
                "id": item.get("id"),
                "state": item.get("state") or "UNVERIFIED",
                "note": clean_text(item.get("note") or "", policy, limit=200),
            }
        )
    return {"runs": runs, "calibration": calibration, "edge_status": "NOT_VALIDATED"}


def _candidate_runs(research_root):
    paths = []
    for name in ("tatd-20261124T125632Z", "remediation-20261124T151500Z", "forensic-20261124T151500Z"):
        path = research_root / name
        if path.exists():
            paths.append(path)
    return paths


def _research_run(path, policy):
    coverage = _load(path / "coverage_report.json")
    summary = _load(path / "corrected_scanner_summary.json")
    migration = _load(path / "migration_integrity_summary.json")
    evidence = _load(path / "evidence_package.json")
    baseline = _load(path / "baseline_comparison.json")
    findings = []
    gates = []
    limitations = []
    sample_size = None
    observation_period = "UNKNOWN"
    if coverage:
        summary_counts = coverage.get("summary") or {}
        sample_size = summary_counts.get("tokens")
        observation_period = f"archive depth {coverage.get('archive_depth_hours', '?')}h"
        findings.append(
            f"{summary_counts.get('tokens', 0)} tokens reconstructed; "
            f"{summary_counts.get('with_graduation', 0)} with observed graduation; "
            f"{summary_counts.get('truncated', 0)} truncated by archive depth."
        )
        limitations.append(
            "Bitquery archive depth is about 8 hours; early trades are truncated for some tokens."
        )
    if summary:
        findings.append(
            f"{summary.get('configurations', 0)} scanner configurations evaluated; "
            f"{summary.get('identifiable', 0)} identifiable and {summary.get('not_identifiable', 0)} not identifiable."
        )
        limitations.append("Scanner calibration remains exploratory; activation is false.")
    if migration:
        counts = migration.get("counts") or {}
        findings.append(
            "Migration integrity audit: "
            + ", ".join(f"{key} {value}" for key, value in sorted(counts.items()))
            + "."
        )
        limitations.append(
            "Provider first-trade reference is inflated for some tokens; naive 95% loss counts overstate collapses."
        )
    if evidence:
        gates.append(
            {
                "name": "Credential scan",
                "status": evidence.get("credential_scan_status") or "UNKNOWN",
                "detail": f"{evidence.get('entries', 0)} archive entries; sha256 {evidence.get('sha256', '')[:16]}…",
            }
        )
    if baseline:
        gates.append(
            {
                "name": "Baseline comparison",
                "status": baseline.get("baseline_status") or "UNKNOWN",
                "detail": f"cohort {baseline.get('cohort') or 'UNKNOWN'}",
            }
        )
    if not gates:
        gates.append({"name": "Artifact presence", "status": "PARTIAL", "detail": "Only the artifact index is available."})
    return {
        "id": path.name,
        "category": "Quantitative Market Research" if coverage else "Research",
        "title": "Historical Market Research" if coverage else path.name,
        "dataset": "Bitquery Solana archive" if coverage else "Artifact bundle",
        "observation_period": observation_period,
        "sample_size": sample_size,
        "quality_gates": gates,
        "findings": [clean_text(item, policy, limit=400) for item in findings],
        "limitations": [clean_text(item, policy, limit=400) for item in limitations],
        "reproduction": "See artifact index and manifest in the run directory.",
        "configuration_version": "research-v2.1",
        "evidence_state": "OBSERVED",
    }


def _qualification(evidence, policy):
    rows = []
    for item in evidence.get("qualification") or []:
        rows.append(
            {
                "domain": item.get("domain"),
                "status": item.get("status") or "UNVERIFIED",
                "detail": clean_text(item.get("detail") or "", policy, limit=300),
                "last_observation": item.get("last_observation"),
                "last_failure": item.get("last_failure"),
            }
        )
    return rows


def _system(desk, events, snapshots, generated, policy):
    observed = snapshots[-1].get("observed_at") if snapshots else None
    models = []
    for event in events:
        if event.get("kind") != "model_scout" and not str(event.get("kind", "")).startswith("model_"):
            continue
        body = event.get("body") or {}
        model = body.get("model")
        if not model:
            continue
        if any(item["id"] == model for item in models):
            continue
        models.append(
            {
                "id": model,
                "label": model,
                "role": str(event.get("kind", "")).removeprefix("model_"),
                "configured": True,
                "qualified": False,
                "invoked": True,
                "last_invoked": iso(event.get("observed_at")),
            }
        )
    providers = []
    for provider in _view(desk, "providers").get("providers") or []:
        providers.append(
            {
                "id": provider.get("id") or provider.get("provider"),
                "domain": provider.get("domain") or "UNKNOWN",
                "state": provider.get("state") or "UNVERIFIED",
                "capability": provider.get("capability") or "",
                "last_success": provider.get("last_success"),
                "constraint": provider.get("constraint"),
            }
        )
    return {
        "mode": "PAPER",
        "runtime_state": "SNAPSHOT",
        "qualification_state": "PARTIAL",
        "last_observation": iso(observed),
        "last_failure": None,
        "freshness": freshness(observed, generated),
        "models": models,
        "providers": providers,
    }


def _limitations(policy):
    return [
        "The public application reads a sanitized snapshot, not the private runtime.",
        "Wallet addresses are masked by the publication policy.",
        "The public application is not connected to the private trading runtime.",
        "The demo database is synthetic. Synthetic snapshots are labeled.",
        "Research figures are reported evidence, not live runtime statistics.",
        "No treasury or trading action can be initiated from the public application.",
    ]


def _snapshot_id(snapshots):
    if not snapshots:
        return "snap-empty"
    stamp = datetime.fromtimestamp(snapshots[-1].get("observed_at") or 0, UTC).strftime("%Y%m%dT%H%M%SZ")
    digest = hashlib.sha256(json.dumps([snapshot.get("id") for snapshot in snapshots], sort_keys=True).encode()).hexdigest()[:12]
    return f"snap-{stamp}-{digest}"


def build_bundle(db_path, config_path, research_root=None, evidence_root=None, policy=None, now=None):
    policy = policy or PublicationPolicy()
    research_root = Path(research_root or DEFAULT_RESEARCH)
    evidence_root = Path(evidence_root or DEFAULT_EVIDENCE)
    evidence = _load(evidence_root / "public_evidence.json")
    desk = _desk(db_path, config_path)
    snapshots = _snapshots(desk)
    events = _events(desk)
    states = _states(desk)
    funding = _funding(desk)
    generated = now or (snapshots[-1].get("observed_at") if snapshots else int(datetime.now(UTC).timestamp()))
    return {
        "schema_version": SCHEMA_VERSION,
        "snapshot_id": _snapshot_id(snapshots),
        "generated_at": iso(generated),
        "published_at": iso(generated + policy.publication_delay_seconds),
        "source_runtime_id": "tatd-paper-runtime",
        "execution_mode": "PAPER",
        "data_mode": "SNAPSHOT",
        "data_quality": "SYNTHETIC_DEMO" if snapshots and snapshots[-1].get("source") == "synthetic-demo" else "RUNTIME",
        "publication_delay_seconds": policy.publication_delay_seconds,
        "system": _system(desk, events, snapshots, generated, policy),
        "overview": _overview(desk, funding, snapshots, policy),
        "agents": _agents(desk, events, policy),
        "events": _events_public(events, snapshots, policy),
        "market": _market(desk, snapshots, policy),
        "memetic": _memetic(states, evidence, policy),
        "ecosystem": _ecosystem(states, snapshots),
        "economy": _economy(funding, policy),
        "treasury": _treasury(desk),
        "decisions": _decisions(events, snapshots, policy),
        "research": _research(research_root, evidence, policy),
        "qualification": _qualification(evidence, policy),
        "limitations": _limitations(policy),
    }
