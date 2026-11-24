import type { MetadataRoute } from "next";

import { getSnapshot } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://tatd-observatory.vercel.app";
  const snapshot = await getSnapshot();
  const routes = [
    "",
    "/desk",
    "/desk/market",
    "/desk/memetic",
    "/desk/ecosystem",
    "/desk/decisions",
    "/desk/positions",
    "/economy",
    "/treasury",
    "/explorer",
    "/research",
    "/system",
    "/docs",
  ];
  const dynamic = [
    ...snapshot.decisions.map((decision) => `/explorer/${decision.id}`),
    ...snapshot.research.runs.map((run) => `/research/${run.id}`),
  ];
  return [...routes, ...dynamic].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(snapshot.generated_at),
    changeFrequency: path === "" ? "daily" : "hourly",
    priority: path === "" ? 1 : 0.7,
  }));
}
