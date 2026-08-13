import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function keyFromEnv(): Buffer {
  const raw = process.env.CASE_ENCRYPTION_KEY;
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  if (process.env.NODE_ENV === "production" && process.env.VITEST !== "true") {
    throw new Error("CASE_ENCRYPTION_KEY must be 64 hex characters in production.");
  }
  return createHash("sha256").update(raw || "cyberdubey-dev-only-not-for-production").digest();
}

export function encryptBuffer(plain: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", keyFromEnv(), iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptBuffer(payload: Buffer): Buffer {
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", keyFromEnv(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function encryptJson(value: unknown): Buffer {
  return encryptBuffer(Buffer.from(JSON.stringify(value), "utf8"));
}

export function decryptJson<T>(payload: Buffer): T {
  return JSON.parse(decryptBuffer(payload).toString("utf8")) as T;
}
