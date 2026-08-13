import { randomBytes, randomInt } from "node:crypto";
import {
  CATEGORIES,
  DECLARATIONS,
  DECLARATION_VERSION,
  INDIA_GATE_MESSAGE,
  INDIA_STATES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MIN_ESTABLISH_CHARS,
  PREFERRED_CONTACT,
  RELATIONSHIPS,
  URGENCY_OPTIONS,
  type InvestigationPayload,
} from "./constants";
import { COUNTRIES as COUNTRY_LIST } from "./countries";

const CASE_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function yymmInIndia(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "2-digit",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "00";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  return `${year}${month}`;
}

export function generateCaseNumber(date = new Date(), randomFn = randomInt): string {
  const yymm = yymmInIndia(date);
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += CASE_ALPHABET[randomFn(CASE_ALPHABET.length)];
  }
  return `CD-${yymm}-${suffix}`;
}

export function isIndiaSubject(value: string): boolean {
  return value === "IN";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function categoryIds(): string[] {
  return CATEGORIES.map((c) => c.id);
}

function subcategoryFor(categoryId: string): string[] {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? [...cat.subcategories] : [];
}

export type ValidationIssue = { field: string; message: string };

export type ValidationResult =
  | { ok: true; payload: InvestigationPayload; seniorReviewRequired: boolean }
  | { ok: false; code: "NOT_INDIA" | "INVALID" | "BOT"; message: string; issues?: ValidationIssue[] };

export function parsePayload(input: Record<string, unknown>): InvestigationPayload {
  const declarations: Record<string, boolean> = {};
  for (const d of DECLARATIONS) {
    declarations[d.id] = input[d.id] === true || input[d.id] === "true" || input[d.id] === "on";
  }
  const str = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");
  return {
    subjectLocation: str("subjectLocation"),
    clientCountry: str("clientCountry"),
    category: str("category"),
    subcategory: str("subcategory"),
    indiaState: str("indiaState"),
    indiaCity: str("indiaCity"),
    urgency: str("urgency"),
    moneyAtRisk: str("moneyAtRisk"),
    fullName: str("fullName"),
    email: str("email"),
    phoneCountry: str("phoneCountry"),
    phoneNumber: str("phoneNumber"),
    preferredContact: str("preferredContact"),
    clientCity: str("clientCity"),
    clientType: str("clientType"),
    organisationName: str("organisationName"),
    organisationRole: str("organisationRole"),
    establish: str("establish"),
    relationship: str("relationship"),
    relationshipOther: str("relationshipOther"),
    purpose: str("purpose"),
    adverseDecision: str("adverseDecision"),
    reportedAuthorities: str("reportedAuthorities"),
    courtCase: str("courtCase"),
    valueAtRisk: str("valueAtRisk"),
    declarations,
    honeypot: str("website"),
    startedAt: str("startedAt"),
  };
}

export function validateSubmission(
  input: Record<string, unknown>,
  options: { now?: number; minFillMs?: number } = {},
): ValidationResult {
  const payload = parsePayload(input);
  const now = options.now ?? Date.now();
  const minFillMs = options.minFillMs ?? 4000;

  if (payload.honeypot) {
    return { ok: false, code: "BOT", message: "Unable to accept this submission." };
  }

  if (payload.startedAt) {
    const started = Number(payload.startedAt);
    if (Number.isFinite(started) && now - started < minFillMs) {
      return { ok: false, code: "BOT", message: "Unable to accept this submission." };
    }
  }

  if (!isIndiaSubject(payload.subjectLocation)) {
    return { ok: false, code: "NOT_INDIA", message: INDIA_GATE_MESSAGE };
  }

  const issues: ValidationIssue[] = [];
  const requireField = (field: keyof InvestigationPayload, message: string) => {
    if (!payload[field]) issues.push({ field, message });
  };

  requireField("clientCountry", "Please tell us which country you are in.");
  if (payload.clientCountry && !COUNTRY_LIST.some((c) => c.code === payload.clientCountry)) {
    issues.push({ field: "clientCountry", message: "Please choose a country from the list." });
  }

  if (!categoryIds().includes(payload.category)) {
    issues.push({ field: "category", message: "Please choose a category." });
  } else if (!subcategoryFor(payload.category).includes(payload.subcategory)) {
    issues.push({ field: "subcategory", message: "Please choose a sub-category." });
  }

  if (!INDIA_STATES.includes(payload.indiaState as (typeof INDIA_STATES)[number])) {
    issues.push({ field: "indiaState", message: "Please choose the Indian state or union territory." });
  }

  if (!URGENCY_OPTIONS.some((u) => u.id === payload.urgency)) {
    issues.push({ field: "urgency", message: "Please choose an urgency." });
  }

  if (payload.moneyAtRisk !== "yes" && payload.moneyAtRisk !== "no") {
    issues.push({ field: "moneyAtRisk", message: "Please say whether money is at risk right now." });
  }

  requireField("fullName", "Please enter your full name.");
  if (!EMAIL_RE.test(payload.email)) {
    issues.push({ field: "email", message: "Please enter a valid email address." });
  }
  requireField("phoneCountry", "Please choose a country code.");
  requireField("phoneNumber", "Please enter a phone number.");
  if (!PREFERRED_CONTACT.some((p) => p.id === payload.preferredContact)) {
    issues.push({ field: "preferredContact", message: "Please choose a preferred contact method." });
  }
  requireField("clientCity", "Please enter your city and country.");
  if (payload.clientType !== "individual" && payload.clientType !== "organisation") {
    issues.push({ field: "clientType", message: "Please say whether you are an individual or an organisation." });
  }
  if (payload.clientType === "organisation") {
    requireField("organisationName", "Please enter the organisation name.");
    requireField("organisationRole", "Please enter your role.");
  }

  if (payload.establish.length < MIN_ESTABLISH_CHARS) {
    issues.push({
      field: "establish",
      message: `Please tell us what you want to establish (at least ${MIN_ESTABLISH_CHARS} characters).`,
    });
  }
  if (![...RELATIONSHIPS].includes(payload.relationship as (typeof RELATIONSHIPS)[number])) {
    issues.push({ field: "relationship", message: "Please choose your relationship to the person or matter." });
  }
  if (payload.relationship === "Other" && !payload.relationshipOther) {
    issues.push({ field: "relationshipOther", message: "Please describe your relationship." });
  }
  requireField("purpose", "Please tell us why you need this information.");

  if (payload.adverseDecision !== "yes" && payload.adverseDecision !== "no") {
    issues.push({
      field: "adverseDecision",
      message: "Please say whether this report will be used to decide someone's job, tenancy, credit or insurance.",
    });
  }
  if (!["yes", "no", "not_yet"].includes(payload.reportedAuthorities)) {
    issues.push({ field: "reportedAuthorities", message: "Please say whether this has been reported to police or a regulator." });
  }
  if (payload.courtCase !== "yes" && payload.courtCase !== "no") {
    issues.push({ field: "courtCase", message: "Please say whether there is a court case going on." });
  }

  for (const d of DECLARATIONS) {
    if (!payload.declarations[d.id]) {
      issues.push({ field: d.id, message: "All four confirmations are required." });
    }
  }

  if (issues.length) {
    return { ok: false, code: "INVALID", message: "Please check the highlighted fields.", issues };
  }

  return {
    ok: true,
    payload,
    seniorReviewRequired: payload.adverseDecision === "yes",
  };
}

export function validateFiles(
  files: { name: string; type: string; size: number }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (files.length > MAX_FILES) {
    issues.push({ field: "files", message: `You can upload at most ${MAX_FILES} files.` });
  }
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      issues.push({ field: "files", message: `${file.name} is larger than 25MB.` });
    }
  }
  return issues;
}

export { DECLARATION_VERSION, randomBytes };
