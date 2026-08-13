import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DECLARATION_VERSION,
  WORKING_TIMEZONE,
  type InvestigationPayload,
  type StoredCase,
  type StoredFile,
} from "./constants";
import { decryptJson, encryptBuffer, encryptJson } from "./crypto";
import { ensureDataSubdir } from "./data-dir";
import { generateCaseNumber } from "./validation";

async function casesDir() {
  return ensureDataSubdir("cases");
}

async function uploadsDir() {
  return ensureDataSubdir("uploads");
}

async function casePath(caseNumber: string): Promise<string> {
  return path.join(await casesDir(), `${caseNumber}.enc`);
}

export function addWorkingHours(from: Date, hours: number): Date {
  const result = new Date(from);
  let remaining = hours;
  while (remaining > 0) {
    result.setTime(result.getTime() + 60 * 60 * 1000);
    const local = new Date(result.toLocaleString("en-US", { timeZone: WORKING_TIMEZONE }));
    const day = local.getDay();
    const hour = local.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHour = hour >= 10 && hour < 18;
    if (isWeekday && isWorkingHour) remaining -= 1;
  }
  return result;
}

export async function createCase(input: {
  payload: InvestigationPayload;
  seniorReviewRequired: boolean;
  files: StoredFile[];
  now?: Date;
}): Promise<StoredCase> {
  const now = input.now ?? new Date();
  let caseNumber = generateCaseNumber(now);
  for (let i = 0; i < 8; i += 1) {
    try {
      await readFile(await casePath(caseNumber));
      caseNumber = generateCaseNumber(now);
    } catch {
      break;
    }
  }

  const record: StoredCase = {
    caseNumber,
    status: input.seniorReviewRequired ? "Awaiting senior review" : "Awaiting review",
    createdAt: now.toISOString(),
    timezone: WORKING_TIMEZONE,
    reviewDueBy: addWorkingHours(now, 48).toISOString(),
    seniorReviewRequired: input.seniorReviewRequired,
    declarationVersion: DECLARATION_VERSION,
    declarationAgreedAt: now.toISOString(),
    payload: input.payload,
    files: input.files,
  };

  await writeFile(await casePath(caseNumber), encryptJson(record));
  return record;
}

export async function readCase(caseNumber: string): Promise<StoredCase | null> {
  try {
    const buf = await readFile(await casePath(caseNumber));
    return decryptJson<StoredCase>(buf);
  } catch {
    return null;
  }
}

export async function listCases(): Promise<StoredCase[]> {
  const dir = await casesDir();
  const names = await readdir(dir);
  const cases: StoredCase[] = [];
  for (const name of names) {
    if (!name.endsWith(".enc")) continue;
    try {
      const record = decryptJson<StoredCase>(await readFile(path.join(dir, name)));
      cases.push(record);
    } catch {
      // skip unreadable
    }
  }
  return cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveUpload(file: {
  originalName: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<StoredFile> {
  const dir = await uploadsDir();
  const id = randomUUID();
  const stored: StoredFile = {
    id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.bytes.length,
  };
  await writeFile(path.join(dir, `${id}.enc`), encryptBuffer(file.bytes));
  await writeFile(path.join(dir, `${id}.name`), encryptJson({ name: file.originalName, mime: file.mimeType }));
  return stored;
}

export function uploadPath(id: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid upload id");
  }
  // Resolved lazily by callers that already know the data dir; keep for type compat.
  return id;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
