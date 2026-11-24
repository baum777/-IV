"""Public contracts: schema version, agent identity, event vocabulary.

These constants define what the public projection is allowed to say. They are
intentionally explicit so that a reviewer can diff them against the runtime.
"""

SCHEMA_VERSION = "1.0"

AGENTS = (
    {
        "id": "M01",
        "name": "The Scout",
        "role": "Market Intelligence",
        "responsibility": "Finds opportunities in on-chain activity.",
        "color": "#508FCF",
        "glyph": "scout",
        "model_key": "scout",
        "route": "/desk/market",
    },
    {
        "id": "M02",
        "name": "The Mind",
        "role": "Memetic Intelligence",
        "responsibility": "Discovers emerging cultural narratives.",
        "color": "#A78BFA",
        "glyph": "mind",
        "model_key": "narrative",
        "route": "/desk/memetic",
    },
    {
        "id": "M03",
        "name": "The Watcher",
        "role": "Ecosystem Intelligence",
        "responsibility": "Observes the economic condition of the system.",
        "color": "#36B5A0",
        "glyph": "watcher",
        "model_key": "health",
        "route": "/desk/ecosystem",
    },
    {
        "id": "M04",
        "name": "The Executor",
        "role": "Decision Intelligence",
        "responsibility": "Evaluates evidence and proposes action.",
        "color": "#D5B477",
        "glyph": "executor",
        "model_key": "groundhog",
        "route": "/desk/decisions",
    },
)

# Runtime event kind -> public event family. Anything not listed is dropped
# from the public feed rather than published with an invented type.
EVENT_MAP = {
    "protocol_fee": ("fee.received", "payment"),
    "fee.allocated": ("fee.allocated", "payment"),
    "scanner_prefilter": ("candidate.discovered", "market"),
    "scan_complete": ("scan.completed", "market"),
    "model_scout": ("candidate.qualified", "market"),
    "model_narrative": ("narrative.updated", "memetic"),
    "model_health": ("ecosystem.updated", "ecosystem"),
    "trade_decision": ("decision.completed", "decision"),
    "trade_exit": ("position.closed", "position"),
    "treasury_decision": ("treasury.proposed", "treasury"),
    "treasury_override": ("treasury.executed", "treasury"),
    "payment.requested": ("payment.requested", "payment"),
    "payment.settled": ("payment.settled", "payment"),
    "payment.rejected": ("payment.rejected", "payment"),
    "provider_degraded": ("provider.degraded", "provider"),
    "provider_recovered": ("provider.recovered", "provider"),
}

# Event families required by the work order. The feed shows the union of
# these and the families actually observed in the runtime.
EVENT_FAMILIES = (
    "candidate.discovered",
    "candidate.qualified",
    "candidate.rejected",
    "narrative.discovered",
    "narrative.updated",
    "narrative.accelerating",
    "narrative.reactivated",
    "ecosystem.updated",
    "decision.requested",
    "decision.completed",
    "decision.abstained",
    "policy.passed",
    "policy.rejected",
    "position.opened",
    "position.closed",
    "treasury.proposed",
    "treasury.executed",
    "payment.requested",
    "payment.settled",
    "payment.rejected",
    "research.completed",
    "calibration.proposed",
    "provider.degraded",
    "provider.recovered",
    "fee.received",
    "fee.allocated",
    "scan.completed",
)

AGENT_FOR_EVENT = {
    "candidate": "M01",
    "scan": "M01",
    "narrative": "M02",
    "ecosystem": "M03",
    "decision": "M04",
    "policy": "M04",
    "position": "M04",
    "treasury": "M04",
    "payment": "M04",
    "fee": "M04",
    "provider": "M03",
    "research": "M04",
    "calibration": "M04",
}

SCANNERS = (
    {
        "id": "S01",
        "code": "S01_EARLY_IGNITION",
        "name": "Early Ignition",
        "description": "First credible acceleration out of quiet launch activity.",
    },
    {
        "id": "S02",
        "code": "S02_ORGANIC_GROWTH",
        "name": "Organic Growth",
        "description": "Broadening wallet participation without concentration.",
    },
    {
        "id": "S03",
        "code": "S03_GRADUATION",
        "name": "Graduation",
        "description": "Progress toward a completed bonding-curve migration.",
    },
    {
        "id": "S04",
        "code": "S04_MOMENTUM",
        "name": "Momentum",
        "description": "Sustained price and volume continuation.",
    },
    {
        "id": "S05",
        "code": "S05_QUIET_ACCUMULATION",
        "name": "Quiet Accumulation",
        "description": "Buy pressure without proportional attention.",
    },
    {
        "id": "S06",
        "code": "S06_REACCELERATION",
        "name": "Reacceleration",
        "description": "Second expansion after a contraction phase.",
    },
)

SCANNER_PROFILES = (
    {"id": "P01", "name": "Aggressive", "quantile": 0.25},
    {"id": "P02", "name": "Balanced", "quantile": 0.50},
    {"id": "P03", "name": "Selective", "quantile": 0.75},
)

MEMETIC_SCANNERS = (
    {"id": "N01", "name": "Genesis Hunter", "description": "Earliest cultural evidence of a narrative."},
    {"id": "N02", "name": "Replication Hunter", "description": "Independent replication across creators."},
    {"id": "N03", "name": "Cross-Cultural Breakout", "description": "Narrative crossing community boundaries."},
    {"id": "N04", "name": "Narrative Migration", "description": "Narrative moving to a new platform or language."},
    {"id": "N05", "name": "Resurrection Hunter", "description": "Dormant narrative returning to attention."},
    {"id": "N06", "name": "Narrative Divergence", "description": "Narrative splitting into distinct variants."},
)

QUALIFICATION_DOMAINS = (
    "Trading Runtime",
    "Market Data Providers",
    "Cultural Data Providers",
    "Model Providers",
    "Decision Models",
    "Wallet Provisioning",
    "Payment Gateway",
    "x402 Settlement",
    "Prepaid Funding",
    "Public Evidence Projection",
    "Historical Research",
    "Memetic Research",
    "Paper Trading",
    "Live Trading",
)

QUALIFICATION_STATES = (
    "IMPLEMENTED",
    "UNIT_TESTED",
    "INTEGRATION_TESTED",
    "DOCUMENTATION_VERIFIED",
    "PROVIDER_VERIFIED",
    "EMPIRICALLY_QUALIFIED",
    "PARTIAL",
    "BLOCKED",
    "FAILED",
    "UNVERIFIED",
)

EVIDENCE_STATES = ("VERIFIED", "OBSERVED", "INFERRED", "UNKNOWN")
FRESHNESS_STATES = ("CURRENT", "DELAYED", "STALE", "UNAVAILABLE")
EXECUTION_MODES = ("LIVE", "PAPER", "REPLAY", "FIXTURE")

SECRET_PATTERNS = (
    "sk-",
    "sk_live_",
    "sk_test_",
    "AIza",
    "ghp_",
    "gho_",
    "github_pat_",
    "xoxb-",
    "xoxp-",
    "-----BEGIN",
    "PRIVATE KEY",
    "mnemonic",
    "api_key",
    "apikey",
    "Authorization: Bearer",
)
