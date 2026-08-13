const COOKIE = "cd_staff";
const MAX_AGE_MS = 8 * 60 * 60 * 1000;
const encoder = new TextEncoder();

export { COOKIE, MAX_AGE_MS };

function sessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.CASE_ENCRYPTION_KEY || "dev-session-secret";
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return hex(sig);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function signSession(username: string, now = Date.now()): Promise<string> {
  const payload = `${username}.${now}`;
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

export async function readSession(token: string | undefined, now = Date.now()): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, ts, sig] = parts;
  const payload = `${username}.${ts}`;
  const expected = await hmacHex(payload);
  if (!safeEqual(sig, expected)) return null;
  const created = Number(ts);
  if (!Number.isFinite(created) || now - created > MAX_AGE_MS) return null;
  return username;
}
