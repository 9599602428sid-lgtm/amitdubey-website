import { access, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let resolved: string | null = null;

async function canWrite(dir: string): Promise<boolean> {
  try {
    await mkdir(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    await writeFile(probe, "ok");
    return true;
  } catch {
    return false;
  }
}

/**
 * Prefer DATA_DIR, then ./data, then OS temp.
 * Netlify / serverless filesystems are usually read-only except /tmp.
 */
export async function getDataDir(): Promise<string> {
  if (resolved) return resolved;

  const candidates = [
    process.env.DATA_DIR,
    path.join(process.cwd(), "data"),
    path.join(os.tmpdir(), "cyberdubey-data"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (await canWrite(candidate)) {
      resolved = candidate;
      return resolved;
    }
  }

  resolved = path.join(os.tmpdir(), "cyberdubey-data");
  await mkdir(resolved, { recursive: true });
  return resolved;
}

export async function ensureDataSubdir(...parts: string[]): Promise<string> {
  const dir = path.join(await getDataDir(), ...parts);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function dataPath(...parts: string[]): Promise<string> {
  return path.join(await getDataDir(), ...parts);
}

export async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
