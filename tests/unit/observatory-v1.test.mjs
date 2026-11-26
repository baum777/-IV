import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../../lib/observatory-v1.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
new Function("exports", "require", compiled.outputText)(exports, createRequire(import.meta.url));
const { readProjection, readResponse } = exports;
const now = Date.parse("2026-11-26T13:00:00Z");
const blank = { version: "tatd.observatory.v1", publishedAt: new Date(now).toISOString(), sourceRevision: "a".repeat(40) };
const active = {
  id: "run-01", classification: "Six-hour paper experiment", state: "ACTIVE", mode: "PAPER_ONLY",
  startedAt: "2026-11-26T12:00:00Z", heartbeatAt: blank.publishedAt, durationSeconds: 21600, elapsedSeconds: 3600,
};

test("empty and completed projections preserve meaningful missing data", () => {
  assert.deepEqual(readProjection(blank, "CONNECTED", now).data.market, []);
  const completed = { ...blank, session: { ...active, state: "COMPLETED" } };
  assert.equal(readProjection(completed, "SNAPSHOT", now + 86400000).data.session.state, "COMPLETED");
});

test("active projection expires on publication, heartbeat and schedule independently", () => {
  assert.equal(readProjection({ ...blank, session: active }, "CONNECTED", now).mode, "CONNECTED");
  assert.equal(readProjection(blank, "CONNECTED", now + 120001).reason, "STALE");
  assert.equal(readProjection({ ...blank, session: { ...active, heartbeatAt: active.startedAt } }, "CONNECTED", now).reason, "STALE");
  assert.equal(readProjection({ ...blank, session: { ...active, durationSeconds: 3600 } }, "CONNECTED", now).reason, "STALE");
});

test("rejects unknown fields, synthetic modes, future data and invalid records", () => {
  assert.equal(readResponse({ mode: "DEMO", data: blank }, now).reason, "INVALID");
  assert.equal(readProjection({ ...blank, rawTrace: "synthetic" }, "SNAPSHOT", now).reason, "INVALID");
  assert.equal(readProjection(blank, "SNAPSHOT", now - 6000).reason, "INVALID");
  assert.equal(readProjection({ ...blank, session: { ...active, classification: "/home/private/trace" } }, "CONNECTED", now).reason, "INVALID");
  assert.equal(readProjection({ ...blank, session: { ...active, heartbeatAt: null } }, "CONNECTED", now).reason, "INVALID");
  assert.equal(readProjection({ ...blank, execution: [{ id: "test", at: blank.publishedAt, stage: "FILL", summary: "Fixture" }] }, "CONNECTED", now).reason, "INVALID");
});
