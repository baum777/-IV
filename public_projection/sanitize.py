"""Text, number and secret sanitization for the public projection."""

import html
import re
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation

from .contracts import SECRET_PATTERNS
from .policy import PublicationPolicy

_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_WHITESPACE = re.compile(r"\s+")
_ADDRESS = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")


def iso(timestamp: int | float | None) -> str | None:
    """Convert an epoch second value to an ISO-8601 UTC string."""
    if timestamp is None:
        return None
    try:
        return datetime.fromtimestamp(int(timestamp), UTC).isoformat().replace("+00:00", "Z")
    except (OverflowError, OSError, ValueError):
        return None


def clean_text(value, policy: PublicationPolicy, limit: int | None = None) -> str:
    """Bound, normalize and escape a provider-supplied text value."""
    if value is None:
        return ""
    text = _CONTROL.sub(" ", str(value))
    text = _WHITESPACE.sub(" ", text).strip()
    text = html.escape(text, quote=False)
    bound = limit or policy.max_text_length
    if len(text) > bound:
        text = text[: bound - 1].rstrip() + "…"
    return text


def safe_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def safe_float(value, default=None):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if number != number or number in (float("inf"), float("-inf")):
        return default
    return number


def decimal_string(value):
    """Normalize a decimal price without binary float drift."""
    try:
        return format(Decimal(str(value)).normalize(), "f")
    except (InvalidOperation, ValueError):
        return None


def cents_to_usd(cents):
    if cents is None:
        return None
    return f"{Decimal(cents) / 100:.2f}"


def redact_address(value: str | None, policy: PublicationPolicy) -> str | None:
    if not value:
        return None
    return policy.mask_address(value)


def contains_secret(value: str) -> bool:
    return any(pattern in value for pattern in SECRET_PATTERNS)


def assert_no_secrets(payload, path: str = "$") -> None:
    """Fail closed if any string in the payload looks like a credential."""
    if isinstance(payload, dict):
        for key, item in payload.items():
            assert_no_secrets(item, f"{path}.{key}")
    elif isinstance(payload, list):
        for index, item in enumerate(payload):
            assert_no_secrets(item, f"{path}[{index}]")
    elif isinstance(payload, str):
        if contains_secret(payload):
            raise ValueError(f"Secret-like value detected at {path}")


def public_verdict(value: str | None) -> str:
    """Map a runtime verdict into the public evidence vocabulary."""
    if value in {"PASS", "PASSED", "VERIFIED", "QUALIFIED"}:
        return "VERIFIED"
    if value in {"PARTIAL", "OBSERVED"}:
        return "OBSERVED"
    if value in {"UNKNOWN", "UNVERIFIED", "NOT_VERIFIED"}:
        return "UNKNOWN"
    return "INFERRED"


def freshness(observed_at: int | None, now: int, *, current_seconds: int = 900, delayed_seconds: int = 86400) -> str:
    if observed_at is None:
        return "UNAVAILABLE"
    age = max(0, now - int(observed_at))
    if age <= current_seconds:
        return "CURRENT"
    if age <= delayed_seconds:
        return "DELAYED"
    return "STALE"
