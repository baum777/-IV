import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.SCREENSHOT_BASE || "http://127.0.0.1:3100";
const OUT = process.env.SCREENSHOT_OUT || path.join(process.cwd(), "review-artifacts");

const SHOTS = [
  { name: "desktop-landing", path: "/", width: 1440, height: 900 },
  { name: "desktop-desk", path: "/desk", width: 1440, height: 900 },
  { name: "desktop-market", path: "/desk/market", width: 1440, height: 900 },
  { name: "desktop-memetic", path: "/desk/memetic", width: 1440, height: 900 },
  { name: "desktop-ecosystem", path: "/desk/ecosystem", width: 1440, height: 900 },
  { name: "desktop-decisions", path: "/desk/decisions", width: 1440, height: 900 },
  { name: "desktop-explorer", path: "/explorer/decision-15", width: 1440, height: 900 },
  { name: "desktop-economy", path: "/economy", width: 1440, height: 900 },
  { name: "desktop-research", path: "/research", width: 1440, height: 900 },
  { name: "desktop-system", path: "/system", width: 1440, height: 900 },
  { name: "desktop-docs", path: "/docs", width: 1440, height: 900 },
  { name: "mobile-landing", path: "/", width: 390, height: 844 },
  { name: "mobile-desk", path: "/desk", width: 390, height: 844 },
  { name: "mobile-explorer", path: "/explorer/decision-15", width: 390, height: 844 },
];

const results = [];
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  const response = await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  const status = response ? response.status() : 0;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  results.push({ name: shot.name, path: shot.path, status, overflow, errors, file });
  await page.close();
}

await browser.close();
await writeFile(path.join(OUT, "screenshot-report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
