import { expect, test } from "@playwright/test";

const SECTIONS = [
  { anchor: "#genesis", label: "Genesis" },
  { anchor: "#instances", label: "Instances" },
  { anchor: "#architecture", label: "Architecture" },
  { anchor: "#metabolism", label: "Metabolism" },
  { anchor: "#evidence", label: "Evidence" },
  { anchor: "#manifesto", label: "Manifesto" },
];

const PUBLIC_ROUTES = [
  "/",
  "/desk",
  "/desk/decisions",
  "/desk/ecosystem",
  "/desk/market",
  "/desk/memetic",
  "/desk/positions",
  "/docs",
  "/economy",
  "/explorer",
  "/research",
  "/system",
  "/treasury",
];

test.describe("landing page", () => {
  test("renders the hero and every narrative section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveCount(1);
    // The hero splits the headline across a <br>, so assert the two halves.
    await expect(page.locator("h1")).toContainText("INTELLIGENCE");
    await expect(page.locator("h1")).toContainText("MADE MATTER");

    for (const section of SECTIONS) {
      await expect(page.locator(section.anchor)).toBeVisible();
    }

    // The proof section carries the "observe the system" promise.
    await expect(page.locator("#evidence")).toContainText("OBSERVE THE SYSTEM");
  });

  test("anchor navigation resolves to real sections", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Landing page sections" });
    for (const section of SECTIONS) {
      const link = nav.getByRole("link", { name: section.label });
      await expect(link).toHaveAttribute("href", section.anchor);
      await expect(page.locator(section.anchor)).toHaveCount(1);
    }
  });

  test("preserves the functional observatory as an extension", async ({ page }) => {
    await page.goto("/");

    // The landing page must not replace the trading desk: links to the real
    // read-only surfaces have to remain reachable from the narrative. The
    // sidebar copy is hidden on mobile, so require a visible link.
    await expect(page.locator('a[href="/desk"]:visible').first()).toBeVisible();
  });

  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});

test.describe("public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} responds without an error page`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("This page could not be found");
    });
  }
});

test.describe("accessibility baseline", () => {
  test("document declares language and landmarks", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("images carry alternative text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let index = 0; index < count; index += 1) {
      await expect(images.nth(index)).toHaveAttribute("alt", /.+/);
    }
  });

  test("interactive controls are keyboard reachable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(focused).not.toBe("BODY");
  });
});
