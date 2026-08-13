import { readFile, writeFile } from "node:fs/promises";
import { hashIp } from "./cases";
import { dataPath, ensureDataSubdir } from "./data-dir";

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

type Bucket = Record<string, number[]>;

const memory: Bucket = {};

async function load(file: string): Promise<Bucket> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Bucket;
  } catch {
    return { ...memory };
  }
}

export async function checkRateLimit(ip: string, now = Date.now()): Promise<{ ok: boolean; retryAfterSec: number }> {
  const key = hashIp(ip || "unknown");

  try {
    await ensureDataSubdir();
    const file = await dataPath("rate-limit.json");
    const data = await load(file);
    const fresh = (data[key] || []).filter((t) => now - t < WINDOW_MS);
    if (fresh.length >= LIMIT) {
      return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - fresh[0])) / 1000) };
    }
    fresh.push(now);
    data[key] = fresh;
    memory[key] = fresh;
    await writeFile(file, JSON.stringify(data));
    return { ok: true, retryAfterSec: 0 };
  } catch {
    const fresh = (memory[key] || []).filter((t) => now - t < WINDOW_MS);
    if (fresh.length >= LIMIT) {
      return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - fresh[0])) / 1000) };
    }
    fresh.push(now);
    memory[key] = fresh;
    return { ok: true, retryAfterSec: 0 };
  }
}
