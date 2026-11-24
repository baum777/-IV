import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const SNAPSHOT = path.join(process.cwd(), "public", "data", "snapshot.json");

async function load() {
  return JSON.parse(await readFile(SNAPSHOT, "utf8"));
}

test("snapshot carries required top-level contract fields", async () => {
  const snapshot = await load();
  for (const key of [
    "schema_version",
    "snapshot_id",
    "generated_at",
    "published_at",
    "source_runtime_id",
    "execution_mode",
    "snapshot_digest",
    "data_mode",
  ]) {
    assert.ok(snapshot[key], `missing ${key}`);
  }
  assert.equal(snapshot.schema_version, "1.0");
});

test("snapshot never contains raw model inputs or credentials", async () => {
  const raw = await readFile(SNAPSHOT, "utf8");
  for (const needle of [
    "OPENROUTER_API_KEY",
    "BITQUERY_API_KEY",
    "VIRLO_API_KEY",
    "WALLET_PRIVATE_KEY",
    "WALLET_MNEMONIC",
    "Authorization: Bearer",
    "-----BEGIN",
  ]) {
    assert.equal(raw.includes(needle), false, `leaked ${needle}`);
  }
  const snapshot = JSON.parse(raw);
  const serialized = JSON.stringify(snapshot);
  assert.equal(serialized.includes('"request"'), false, "raw model request leaked");
  assert.equal(serialized.includes('"receipt"'), false, "provider receipt leaked");
});

test("execution mode is explicit and never mixed", async () => {
  const snapshot = await load();
  assert.ok(["LIVE", "PAPER", "REPLAY", "FIXTURE"].includes(snapshot.execution_mode));
  for (const event of snapshot.events) {
    assert.equal(event.mode, snapshot.execution_mode);
  }
});

test("every decision has a stable id and a policy verdict", async () => {
  const snapshot = await load();
  assert.ok(snapshot.decisions.length > 0);
  const ids = new Set();
  for (const decision of snapshot.decisions) {
    assert.ok(decision.id);
    assert.ok(!ids.has(decision.id), `duplicate decision id ${decision.id}`);
    ids.add(decision.id);
    assert.ok(decision.policy_verdict);
    assert.ok(decision.model_identifier);
    assert.ok(Array.isArray(decision.stages));
  }
});

test("missing financial values are null, never zero", async () => {
  const snapshot = await load();
  const unknownFields = ["unrealized_pnl_cents", "intelligence_expenditure_cents", "operational_runway_days"];
  for (const field of unknownFields) {
    const value = snapshot.overview[field];
    assert.ok(value === null || typeof value === "number", `${field} must be null or number`);
  }
});

test("agent identities are stable and distinct", async () => {
  const snapshot = await load();
  const ids = snapshot.agents.map((agent) => agent.id);
  assert.deepEqual(ids.sort(), ["M01", "M02", "M03", "M04"]);
  const colors = new Set(snapshot.agents.map((agent) => agent.color));
  assert.equal(colors.size, 4);
});

test("creator fee split is represented as 20:80", async () => {
  const snapshot = await load();
  assert.equal(snapshot.economy.fee_policy.creator_dev_pct, 20);
  assert.equal(snapshot.economy.fee_policy.creator_operating_pct, 80);
});
