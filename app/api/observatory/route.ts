import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { readProjection, type Reading } from "@/lib/observatory-v1";

export const dynamic = "force-dynamic";

async function readSnapshot(): Promise<Reading> {
  try {
    const [bytes, digest] = await Promise.all([
      readFile("public/data/observatory-v1.json"),
      readFile("public/data/observatory-v1.sha256", "utf8"),
    ]);
    if (bytes.length > 128_000 || createHash("sha256").update(bytes).digest("hex") !== digest.trim()) {
      return { mode: "UNAVAILABLE", reason: "INVALID" };
    }
    return readProjection(JSON.parse(bytes.toString("utf8")), "SNAPSHOT", Date.now());
  } catch (error) {
    return { mode: "UNAVAILABLE", reason: (error as NodeJS.ErrnoException).code === "ENOENT" ? "MISSING" : "INVALID" };
  }
}

async function readConnected(endpoint: string): Promise<Reading> {
  try {
    const url = new URL(endpoint);
    const token = process.env.OBSERVATORY_PROJECTION_READ_TOKEN;
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !token) {
      return { mode: "UNAVAILABLE", reason: "INVALID" };
    }
    const response = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return { mode: "UNAVAILABLE", reason: "INTERRUPTED" };
    if (!response.headers.get("content-type")?.includes("application/json") || !response.body) {
      return { mode: "UNAVAILABLE", reason: "INVALID" };
    }
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const reader = response.body.getReader();
    let body = "";
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 128_000) {
          await reader.cancel();
          return { mode: "UNAVAILABLE", reason: "INVALID" };
        }
        body += decoder.decode(value, { stream: true });
      }
      return readProjection(JSON.parse(body + decoder.decode()), "CONNECTED", Date.now());
    } catch (error) {
      return { mode: "UNAVAILABLE", reason: error instanceof SyntaxError || error instanceof TypeError ? "INVALID" : "INTERRUPTED" };
    } finally {
      reader.releaseLock();
    }
  } catch {
    return { mode: "UNAVAILABLE", reason: "INTERRUPTED" };
  }
}

export async function GET() {
  const endpoint = process.env.OBSERVATORY_PROJECTION_READ_URL;
  const reading = endpoint ? await readConnected(endpoint) : await readSnapshot();
  return Response.json(reading, { headers: { "Cache-Control": "no-store" } });
}
