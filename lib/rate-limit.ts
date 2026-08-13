import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashIp } from "./cases";

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const FILE = path.join(process.cwd(), "data", "rate-limit.json");

type Bucket = Record<string, number[]>;

async function load(): Promise<Bucket> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Bucket;
  } catch {
    return {};
  }
}

export async function checkRateLimit(ip: string, now = Date.now()): Promise<{ ok: boolean; retryAfterSec: number }> {
  await mkdir(path.dirname(FILE), { recursive: true });
  const key = hashIp(ip || "unknown");
  const data = await load();
  const fresh = (data[key] || []).filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= LIMIT) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - fresh[0])) / 1000);
    return { ok: false, retryAfterSec };
  }
  fresh.push(now);
  data[key] = fresh;
  await writeFile(FILE, JSON.stringify(data));
  return { ok: true, retryAfterSec: 0 };
}
