"""Publication policy for the public projection.

Every field that reaches the public web application passes through this
policy. The defaults are deliberately conservative: wallet addresses are
masked, text is bounded, and no model prompt material is ever published.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class PublicationPolicy:
    """Explicit, reviewable publication decisions."""

    # Wallet publication. The operator has not approved full address
    # publication for the public site, so addresses are masked by default.
    publish_wallet_addresses: bool = False
    publish_token_mint: bool = False

    # Publication delay in seconds. Paper mode has no front-running risk,
    # so the default delay is zero. Any live mode must set this explicitly.
    publication_delay_seconds: int = 0

    # Text bounds. Prevents unbounded provider text from entering the bundle.
    max_text_length: int = 600
    max_summary_length: int = 280
    max_list_items: int = 200

    # Domains that may be published. Anything else is dropped.
    allowed_domains: tuple[str, ...] = (
        "overview",
        "agents",
        "events",
        "market",
        "memetic",
        "ecosystem",
        "decisions",
        "positions",
        "economy",
        "treasury",
        "research",
        "qualification",
        "system",
    )

    # Model material that must never be published.
    forbidden_keys: frozenset[str] = field(
        default_factory=lambda: frozenset(
            {
                "request",
                "messages",
                "system",
                "raw_output",
                "input",
                "prompt",
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
            }
        )
    )

    def mask_address(self, address: str | None) -> str | None:
        """Return a publishable representation of a wallet address."""
        if not address:
            return None
        if self.publish_wallet_addresses:
            return address
        if len(address) <= 8:
            return "***"
        return f"{address[:4]}…{address[-4:]}"
