"""CLI: python3 -m public_projection --db ... --out ..."""

from __future__ import annotations

import argparse
import json
import sys

from .exporter import build_bundle
from .policy import PublicationPolicy
from .publisher import publish


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="public_projection", description="Export the sanitized TATD public snapshot.")
    parser.add_argument("--db", required=True, help="Path to the paper trading SQLite database.")
    parser.add_argument("--config", default="config.json", help="Path to the runtime configuration.")
    parser.add_argument("--research", default="tatd-research/runs", help="Research runs directory.")
    parser.add_argument("--evidence", default="evidence", help="Evidence directory.")
    parser.add_argument("--out", default="public/data", help="Output directory for the public bundle.")
    parser.add_argument("--publish-addresses", action="store_true", help="Publish wallet addresses (requires authorization).")
    parser.add_argument("--delay", type=int, default=0, help="Publication delay in seconds.")
    args = parser.parse_args(argv)

    policy = PublicationPolicy(
        publish_wallet_addresses=args.publish_addresses,
        publication_delay_seconds=max(0, args.delay),
    )
    bundle = build_bundle(
        db_path=args.db,
        config_path=args.config,
        research_root=args.research,
        evidence_root=args.evidence,
        policy=policy,
    )
    manifest = publish(bundle, args.out)
    print(json.dumps(manifest, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
