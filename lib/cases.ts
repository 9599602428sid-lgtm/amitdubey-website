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
import { decryptJson, decryptJsonFromBase64, encryptBuffer, encryptJson, encryptJsonToBase64, hasValidCaseEncryptionKey } from "./crypto";
import { ensureDataSubdir } from "./data-dir";
import { getServiceSupabase, isSupabaseConfigured } from "./supabase";
import { generateCaseNumber } from "./validation";

const STORAGE_BUCKET = "investigation-uploads";

export type PendingUpload = {
  originalName: string;
  mimeType: string;
  bytes: Buffer;
};

type CaseRow = {
  id: string;
  case_number: string;
  status: StoredCase["status"];
  created_at: string;
  timezone: string;
  review_due_by: string;
  senior_review_required: boolean;
  declaration_version: string;
  declaration_agreed_at: string;
  payload_ciphertext: string;
  files?: FileRow[] | null;
};

type FileRow = {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
};

async function casesDir() {
  return ensureDataSubdir("cases");
}

async function uploadsDir() {
  return ensureDataSubdir("uploads");
}

async function casePath(caseNumber: string): Promise<string> {
  return path.join(await casesDir(), `${caseNumber}.enc`);
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" && process.env.VITEST !== "true";
}

function requireEncryptionKey(): void {
  if (isProductionRuntime() && !hasValidCaseEncryptionKey()) {
    throw new Error("CASE_ENCRYPTION_KEY must be 64 hex characters in production.");
  }
}

function storeMode(): "supabase" | "local" {
  if (isSupabaseConfigured()) return "supabase";
  if (isProductionRuntime()) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production.");
  }
  return "local";
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

export function payloadForStorage(payload: InvestigationPayload): Omit<InvestigationPayload, "honeypot"> {
  const { honeypot: _honeypot, ...rest } = payload;
  return rest;
}

function restorePayload(stored: Omit<InvestigationPayload, "honeypot"> | InvestigationPayload): InvestigationPayload {
  return { ...stored, honeypot: "" };
}

function safeOriginalName(name: string): string {
  const base = name.replace(/[/\\]/g, "_").replace(/[^\w.\- ()[\]]+/g, "_").trim();
  return (base || "file").slice(0, 255);
}

function parseRow(data: unknown): CaseRow | null {
  if (!data) return null;
  if (typeof data === "string") return JSON.parse(data) as CaseRow;
  return data as CaseRow;
}

function parseRows(data: unknown): CaseRow[] {
  if (!data) return [];
  if (typeof data === "string") return JSON.parse(data) as CaseRow[];
  return Array.isArray(data) ? (data as CaseRow[]) : [];
}

function toStoredCase(row: CaseRow): StoredCase {
  return {
    caseNumber: row.case_number,
    status: row.status,
    createdAt: row.created_at,
    timezone: WORKING_TIMEZONE,
    reviewDueBy: row.review_due_by,
    seniorReviewRequired: row.senior_review_required,
    declarationVersion: row.declaration_version,
    declarationAgreedAt: row.declaration_agreed_at,
    payload: restorePayload(decryptJsonFromBase64<Omit<InvestigationPayload, "honeypot">>(row.payload_ciphertext)),
    files: (row.files || []).map((file) => ({
      id: file.id,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size_bytes,
    })),
  };
}

export async function createCase(input: {
  payload: InvestigationPayload;
  seniorReviewRequired: boolean;
  files?: StoredFile[];
  uploads?: PendingUpload[];
  submitterIpHash?: string;
  now?: Date;
}): Promise<StoredCase> {
  if (input.payload.subjectLocation !== "IN") {
    throw new Error("Cases can only be stored for subjects in India.");
  }
  requireEncryptionKey();

  const now = input.now ?? new Date();
  const uploads = input.uploads ?? [];
  const mode = storeMode();

  if (mode === "supabase") {
    return createCaseInSupabase({
      payload: input.payload,
      seniorReviewRequired: input.seniorReviewRequired,
      uploads,
      submitterIpHash: input.submitterIpHash,
      now,
    });
  }

  const storedFiles = [...(input.files ?? [])];
  for (const upload of uploads) {
    storedFiles.push(await saveUploadLocal(upload));
  }

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
    payload: restorePayload(payloadForStorage(input.payload)),
    files: storedFiles,
  };

  await writeFile(await casePath(caseNumber), encryptJson(record));
  return record;
}

async function createCaseInSupabase(input: {
  payload: InvestigationPayload;
  seniorReviewRequired: boolean;
  uploads: PendingUpload[];
  submitterIpHash?: string;
  now: Date;
}): Promise<StoredCase> {
  const supabase = getServiceSupabase();
  const sealed = payloadForStorage(input.payload);
  const payloadCiphertext = encryptJsonToBase64(sealed);

  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const caseNumber = generateCaseNumber(input.now);
    const status = input.seniorReviewRequired ? "Awaiting senior review" : "Awaiting review";
    const createdAt = input.now.toISOString();
    const reviewDueBy = addWorkingHours(input.now, 48).toISOString();

    const { data, error } = await supabase.rpc("investigation_insert_case", {
      p: {
        case_number: caseNumber,
        status,
        created_at: createdAt,
        timezone: WORKING_TIMEZONE,
        review_due_by: reviewDueBy,
        senior_review_required: input.seniorReviewRequired,
        declaration_version: DECLARATION_VERSION,
        declaration_agreed_at: createdAt,
        subject_location: "IN",
        client_country: input.payload.clientCountry,
        category: input.payload.category,
        subcategory: input.payload.subcategory,
        india_state: input.payload.indiaState,
        urgency: input.payload.urgency,
        money_at_risk: input.payload.moneyAtRisk,
        client_type: input.payload.clientType,
        adverse_decision: input.payload.adverseDecision,
        payload_ciphertext: payloadCiphertext,
        submitter_ip_hash: input.submitterIpHash || null,
      },
    });

    if (error) {
      if (error.code === "23505") {
        lastError = error;
        continue;
      }
      throw error;
    }

    const row = parseRow(data);
    if (!row?.id) {
      lastError = new Error("Case insert did not return an id.");
      continue;
    }
    const files: StoredFile[] = [];
    for (const upload of input.uploads) {
      files.push(
        await saveUploadInSupabase({
          caseId: row.id,
          caseNumber,
          upload,
        }),
      );
    }

    return {
      caseNumber,
      status,
      createdAt,
      timezone: WORKING_TIMEZONE,
      reviewDueBy,
      seniorReviewRequired: input.seniorReviewRequired,
      declarationVersion: DECLARATION_VERSION,
      declarationAgreedAt: createdAt,
      payload: restorePayload(sealed),
      files,
    };
  }

  throw lastError instanceof Error ? lastError : new Error("Could not allocate a unique case number.");
}

async function saveUploadInSupabase(input: {
  caseId: string;
  caseNumber: string;
  upload: PendingUpload;
}): Promise<StoredFile> {
  const supabase = getServiceSupabase();
  const id = randomUUID();
  const originalName = safeOriginalName(input.upload.originalName);
  const storagePath = `cases/${input.caseNumber}/${id}.enc`;
  const encrypted = encryptBuffer(input.upload.bytes);

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, new Uint8Array(encrypted), {
    contentType: "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.rpc("investigation_insert_file", {
    p: {
      id,
      case_id: input.caseId,
      original_name: originalName,
      mime_type: input.upload.mimeType,
      size_bytes: input.upload.bytes.length,
      storage_path: storagePath,
    },
  });
  if (insertError) throw insertError;

  return {
    id,
    originalName,
    mimeType: input.upload.mimeType,
    size: input.upload.bytes.length,
  };
}

export async function readCase(caseNumber: string): Promise<StoredCase | null> {
  if (storeMode() === "supabase") {
    const { data, error } = await getServiceSupabase().rpc("investigation_get_case", {
      p_case_number: caseNumber,
    });
    if (error) throw error;
    if (!data) return null;
    const row = parseRow(data);
    return row ? toStoredCase(row) : null;
  }

  try {
    const buf = await readFile(await casePath(caseNumber));
    return decryptJson<StoredCase>(buf);
  } catch {
    return null;
  }
}

export async function listCases(): Promise<StoredCase[]> {
  if (storeMode() === "supabase") {
    const { data, error } = await getServiceSupabase().rpc("investigation_list_cases");
    if (error) throw error;
    const rows = parseRows(data);
    return rows.map(toStoredCase);
  }

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

async function saveUploadLocal(file: PendingUpload): Promise<StoredFile> {
  const dir = await uploadsDir();
  const id = randomUUID();
  const stored: StoredFile = {
    id,
    originalName: safeOriginalName(file.originalName),
    mimeType: file.mimeType,
    size: file.bytes.length,
  };
  await writeFile(path.join(dir, `${id}.enc`), encryptBuffer(file.bytes));
  await writeFile(path.join(dir, `${id}.name`), encryptJson({ name: stored.originalName, mime: file.mimeType }));
  return stored;
}

export async function saveUpload(file: PendingUpload): Promise<StoredFile> {
  requireEncryptionKey();
  if (storeMode() === "supabase") {
    throw new Error("Uploads must be attached to a case. Pass them to createCase.");
  }
  return saveUploadLocal(file);
}

export function uploadPath(id: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid upload id");
  }
  return id;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function hashSubmitterIp(ip: string): string {
  return createHash("sha256").update(`investigation-submit|${ip}`).digest("hex");
}
