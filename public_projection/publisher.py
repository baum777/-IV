"""Atomic, idempotent publication of the public snapshot bundle."""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path

from .contracts import SCHEMA_VERSION
from .sanitize import assert_no_secrets

SNAPSHOT_FILE = "snapshot.json"
MANIFEST_FILE = "manifest.json"


def canonical(bundle: dict) -> bytes:
    """Stable JSON encoding used for the integrity digest."""
    body = {key: value for key, value in bundle.items() if key != "snapshot_digest"}
    return json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(bundle: dict) -> str:
    return "sha256:" + hashlib.sha256(canonical(bundle)).hexdigest()


def _atomic_write(path: Path, payload: bytes) -> None:
    handle = tempfile.NamedTemporaryFile(
        mode="wb", dir=path.parent, prefix=f".{path.name}.", delete=False
    )
    try:
        handle.write(payload)
        handle.flush()
        os.fsync(handle.fileno())
        handle.close()
        os.replace(handle.name, path)
    except BaseException:
        handle.close()
        try:
            os.unlink(handle.name)
        except OSError:
            pass
        raise


def publish(bundle: dict, out_dir: str | Path) -> dict:
    """Write snapshot.json and manifest.json. Returns the publication manifest."""
    assert_no_secrets(bundle)
    target = Path(out_dir)
    target.mkdir(parents=True, exist_ok=True)
    snapshot_path = target / SNAPSHOT_FILE
    manifest_path = target / MANIFEST_FILE

    value = digest(bundle)
    bundle = {**bundle, "snapshot_digest": value}
    payload = json.dumps(bundle, indent=2, sort_keys=True, ensure_ascii=False).encode("utf-8")

    manifest = {
        "schema_version": SCHEMA_VERSION,
        "snapshot_id": bundle.get("snapshot_id"),
        "generated_at": bundle.get("generated_at"),
        "published_at": bundle.get("published_at"),
        "source_runtime_id": bundle.get("source_runtime_id"),
        "execution_mode": bundle.get("execution_mode"),
        "data_mode": bundle.get("data_mode"),
        "snapshot_digest": value,
        "byte_size": len(payload),
    }

    previous = None
    if manifest_path.exists():
        try:
            previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        except ValueError:
            previous = None

    if previous and previous.get("snapshot_digest") == value and snapshot_path.exists():
        manifest["idempotent"] = True
        return manifest

    _atomic_write(snapshot_path, payload)
    _atomic_write(manifest_path, json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8"))
    manifest["idempotent"] = False
    return manifest
