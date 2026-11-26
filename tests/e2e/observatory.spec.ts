import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const path = process.env.OBSERVATORY_EVIDENCE;
const viewports = [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }];
const labels = ["Session & runtime", "The four instances", "Economic state", "Market observation",
  "Execution stream", "Empirical Strategy Genesis", "Infrastructure & providers"];

function fixture(state: string) {
  const current = Date.now();
  const at = (offset: number) => new Date(current + offset).toISOString();
  return {
    mode: state === "completed" ? "SNAPSHOT" : "CONNECTED",
    data: {
      version: "tatd.observatory.v1", publishedAt: at(state === "stale" ? -180000 : 0), sourceRevision: "a".repeat(40),
      session: {
        id: "fixture-run", classification: "Synthetic test fixture", mode: "PAPER_ONLY",
        state: state === "completed" ? "COMPLETED" : state === "standby" ? "STANDBY" : "ACTIVE",
        startedAt: at(-360000), heartbeatAt: at(state === "stale" ? -180000 : 0),
        durationSeconds: 21600, elapsedSeconds: state === "completed" ? 21600 : 360,
      },
      ...(state !== "stale" && state !== "standby" ? {
        instances: [{ element: "FIRE", identity: "Fixture instance", state: "OBSERVING", heartbeatAt: at(0) }],
        economy: { initial: 250000, equity: 250425, available: 240425, reserved: 10000, realized: 425 },
        market: [
          { id: "m1", at: at(-10000), token: "TEST_TOKEN", kind: "SPOT_OBSERVATION", provider: "DexPaprika REST", priceUsd: 0.0001 },
          { id: "m2", at: at(0), token: "TEST_TOKEN", kind: "SPOT_OBSERVATION", provider: "DexPaprika REST", priceUsd: 0.00011 },
        ],
        execution: [{ id: "x1", at: at(0), element: "FIRE", stage: "HOLD", summary: "Synthetic decision" }],
        esge: [
          { id: "e1", hypothesisId: "fixture-hypothesis", at: at(0), element: "FIRE", stage: "OBSERVED", summary: "Synthetic observation" },
          { id: "e2", hypothesisId: "fixture-hypothesis", at: at(0), element: "WATER", stage: "REVISED", summary: "Synthetic revision", contradiction: "Fixture contradiction" },
        ],
        health: [{ service: "Solana RPC", at: at(0), state: state === "degraded" ? "DEGRADED" : "CONNECTED", qualified: true }],
      } : {}),
    },
  };
}

test("real projection has seven accessible sections and a read-only endpoint", async ({ page, request }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  const sizes = info.project.name === "mobile" ? viewports.slice(0, 2) : viewports.slice(2);
  const response = await request.get("/api/observatory");
  expect(response.ok()).toBe(true);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ mode: "UNAVAILABLE", reason: "MISSING" });
  expect((await request.post("/api/observatory")).status()).toBe(405);
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto("/desk");
    await expect(page.getByRole("status").filter({ hasText: "UNAVAILABLE · MISSING" })).toBeVisible();
    await expect(page.locator(".obs-grid > section")).toHaveCount(7);
    for (const name of labels) await expect(page.getByRole("region", { name })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    if (path) {
      await page.getByRole("heading", { name: "Observatory", exact: true }).click();
      await mkdir(path, { recursive: true });
      await page.screenshot({ path: `${path}/unavailable-${size.width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

for (const state of ["active", "standby", "stale", "degraded", "completed"]) {
  test(`renders ${state} projection`, async ({ page }, info) => {
    await page.route("**/api/observatory", route => route.fulfill({ json: fixture(state) }));
    await page.goto("/desk");
    const expected = { active: "ACTIVE", standby: "STANDBY", stale: "UNVERIFIED", degraded: "ACTIVE", completed: "COMPLETED" }[state];
    await expect(page.locator(".obs-runtime")).toHaveText(expected!);
    if (state === "stale") await expect(page.getByRole("status").filter({ hasText: "UNAVAILABLE · STALE" })).toBeVisible();
    if (state === "degraded") await expect(page.locator(".obs-health [data-state=DEGRADED]")).toBeVisible();
    if (state === "completed") {
      await expect(page.getByRole("status").filter({ hasText: "SNAPSHOT" })).toBeVisible();
      await expect(page.locator(".obs-glyph[data-activity]")).toHaveCount(0);
    }
    if (state === "active") {
      await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
      await expect(page.locator(".obs-glyph[data-activity=OBSERVING]")).toHaveCount(1);
      await expect(page.getByRole("img", { name: /Observed spot range/ })).toBeVisible();
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(await page.locator(".obs-glyph[data-activity]").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
      await page.getByLabel("Instance", { exact: true }).selectOption("WATER");
      await expect(page.getByText("Synthetic revision")).toBeVisible();
      await expect(page.getByText("Synthetic observation")).toHaveCount(0);
    }
    if (path) await page.screenshot({ path: `${path}/fixture-${state}-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  });
}

test("rejects invalid responses and recovers after an interrupted connection", async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route("**/api/observatory", async route => {
    requests++;
    if (requests === 1) return route.abort();
    if (requests === 2) return route.fulfill({ json: { mode: "CONNECTED", data: {} } });
    return route.fulfill({ json: fixture("standby") });
  });
  await page.goto("/desk");
  await expect(page.getByRole("status").filter({ hasText: "INTERRUPTED" })).toBeVisible();
  await page.clock.fastForward(15000);
  await expect(page.getByRole("status").filter({ hasText: "INVALID" })).toBeVisible();
  await page.clock.fastForward(15000);
  await expect(page.locator(".obs-runtime")).toHaveText("STANDBY");
});
