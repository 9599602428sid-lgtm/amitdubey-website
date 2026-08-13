import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DECLARATION_VERSION,
  WORKING_TIMEZONE,
  type InvestigationPayload,
  type StoredCase,
  type StoredFile,
} from "./constants";
import { decryptJson, encryptBuffer, encryptJson } from "./crypto";
import { generateCaseNumber } from "./validation";

const DATA_DIR = path.join(process.cwd(), "data");
const CASES_DIR = path.join(DATA_DIR, "cases");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

async function ensureDirs() {
  await mkdir(CASES_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
}

function casePath(caseNumber: string): string {
  return path.join(CASES_DIR, `${caseNumber}.enc`);
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
  await ensureDirs();
  const now = input.now ?? new Date();
  let caseNumber = generateCaseNumber(now);
  for (let i = 0; i < 8; i += 1) {
    try {
      await readFile(casePath(caseNumber));
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

  await writeFile(casePath(caseNumber), encryptJson(record));
  return record;
}

export async function readCase(caseNumber: string): Promise<StoredCase | null> {
  try {
    const buf = await readFile(casePath(caseNumber));
    return decryptJson<StoredCase>(buf);
  } catch {
    return null;
  }
}

export async function listCases(): Promise<StoredCase[]> {
  await ensureDirs();
  const names = await readdir(CASES_DIR);
  const cases: StoredCase[] = [];
  for (const name of names) {
    if (!name.endsWith(".enc")) continue;
    try {
      const record = decryptJson<StoredCase>(await readFile(path.join(CASES_DIR, name)));
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
  await ensureDirs();
  const id = randomUUID();
  const stored: StoredFile = {
    id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.bytes.length,
  };
  await writeFile(path.join(UPLOADS_DIR, `${id}.enc`), encryptBuffer(file.bytes));
  await writeFile(path.join(UPLOADS_DIR, `${id}.name`), encryptJson({ name: file.originalName, mime: file.mimeType }));
  return stored;
}

export function uploadPath(id: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid upload id");
  }
  return path.join(UPLOADS_DIR, `${id}.enc`);
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
