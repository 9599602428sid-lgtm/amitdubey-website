import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { TOTP, Secret } from "otpauth";
import { COOKIE, MAX_AGE_MS, readSession, signSession } from "./session";

export { readSession, signSession };

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function secretsEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

export function isStaffLoginConfigured(): boolean {
  return Boolean(process.env.STAFF_PASSWORD);
}

export function verifyStaff(username: string, password: string, totp = ""): boolean {
  const expectedUser = process.env.STAFF_USERNAME || "reviewer";
  const expectedPass = process.env.STAFF_PASSWORD;
  if (!expectedPass) return false;
  if (!secretsEqual(username, expectedUser) || !secretsEqual(password, expectedPass)) return false;

  const totpSecret = process.env.STAFF_TOTP_SECRET;
  if (!totpSecret) return true;

  const token = new TOTP({
    issuer: "CyberDubey",
    label: expectedUser,
    secret: Secret.fromBase32(totpSecret),
  });
  return token.validate({ token: totp.replace(/\s/g, ""), window: 1 }) !== null;
}

export async function getStaffUser(): Promise<string | null> {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value);
}

export async function setStaffCookie(username: string) {
  const jar = await cookies();
  jar.set(COOKIE, await signSession(username), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/internal",
    maxAge: MAX_AGE_MS / 1000,
  });
}

export async function clearStaffCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
