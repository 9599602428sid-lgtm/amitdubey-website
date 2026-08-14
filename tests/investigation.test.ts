import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { INDIA_GATE_MESSAGE } from "../lib/constants";
import { decryptJson, encryptJson } from "../lib/crypto";
import { detectAllowedFile } from "../lib/files";
import { generateCaseNumber, isIndiaSubject, validateSubmission } from "../lib/validation";

process.env.CASE_ENCRYPTION_KEY = "a".repeat(64);
process.env.VITEST = "true";
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

function validInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    subjectLocation: "IN",
    clientCountry: "GB",
    category: "personal",
    subcategory: "Pre-marriage / matrimonial verification",
    indiaState: "Maharashtra",
    indiaCity: "Mumbai",
    urgency: "standard",
    moneyAtRisk: "no",
    fullName: "Jordan Client",
    email: "jordan@example.com",
    phoneCountry: "+44",
    phoneNumber: "7700900000",
    preferredContact: "email_only",
    clientCity: "London, United Kingdom",
    clientType: "individual",
    establish: "I need to verify whether the person named on a marriage proposal actually lives and works at the addresses given in Mumbai, and whether the company they claim to run exists. ".repeat(1),
    relationship: "Prospective spouse or their family",
    purpose: "To decide whether to proceed with a family introduction.",
    adverseDecision: "no",
    reportedAuthorities: "not_yet",
    courtCase: "no",
    d1: true,
    d2: true,
    d3: true,
    d4: true,
    startedAt: String(Date.now() - 10_000),
    website: "",
    ...overrides,
  };
}

describe("India-only gate", () => {
  it("accepts India as the subject location", () => {
    const result = validateSubmission(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.subjectLocation).toBe("IN");
  });

  it("refuses a subject located outside India and does not return a payload to store", () => {
    const result = validateSubmission(validInput({ subjectLocation: "OUTSIDE" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_INDIA");
      expect(result.message).toBe(INDIA_GATE_MESSAGE);
    }
  });

  it("refuses an empty subject location as not India", () => {
    const result = validateSubmission(validInput({ subjectLocation: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("NOT_INDIA");
  });

  it("treats only IN as India", () => {
    expect(isIndiaSubject("IN")).toBe(true);
    expect(isIndiaSubject("GB")).toBe(false);
    expect(isIndiaSubject("OUTSIDE")).toBe(false);
  });
});

describe("case numbers", () => {
  it("matches CD-YYMM-4 characters", () => {
    const number = generateCaseNumber(new Date("2026-08-13T12:00:00Z"), () => 0);
    expect(number).toMatch(/^CD-\d{4}-[0-9A-Z]{4}$/);
    expect(number.startsWith("CD-2608-")).toBe(true);
  });
});

describe("declarations and review flags", () => {
  it("requires all four declarations", () => {
    const result = validateSubmission(validInput({ d4: false }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues?.some((i) => i.field === "d4")).toBe(true);
  });

  it("flags senior review when the report would decide a job, tenancy, credit or insurance", () => {
    const result = validateSubmission(validInput({ adverseDecision: "yes" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.seniorReviewRequired).toBe(true);
  });

  it("rejects establish text shorter than 100 characters", () => {
    const result = validateSubmission(validInput({ establish: "Too short" }));
    expect(result.ok).toBe(false);
  });
});

describe("encryption", () => {
  it("round-trips case JSON", () => {
    const payload = { caseNumber: "CD-2608-0417", hello: "world" };
    const encrypted = encryptJson(payload);
    expect(encrypted.includes(Buffer.from("CD-2608-0417"))).toBe(false);
    expect(decryptJson<typeof payload>(encrypted)).toEqual(payload);
  });
});

describe("uploads", () => {
  it("accepts a PDF signature and rejects an executable disguise", () => {
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4"), Buffer.from("test")]);
    expect(detectAllowedFile("note.pdf", pdf)).toBe("pdf");
    const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
    expect(detectAllowedFile("note.pdf", exe)).toBeNull();
  });
});

describe("storage payload", () => {
  it("strips the honeypot before sealing", async () => {
    const { payloadForStorage } = await import("../lib/cases");
    const parsed = validateSubmission(validInput({ website: "" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const stored = payloadForStorage({ ...parsed.payload, honeypot: "http://spam.test" });
    expect("honeypot" in stored).toBe(false);
    expect(JSON.stringify(stored)).not.toContain("spam.test");
  });

  it("hashes submitter IPs to full SHA-256 hex", async () => {
    const { hashSubmitterIp } = await import("../lib/cases");
    const hash = hashSubmitterIp("203.0.113.10");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("203.0.113.10");
  });

  it("refuses to persist a case when the subject is not in India", async () => {
    const { createCase } = await import("../lib/cases");
    const parsed = validateSubmission(validInput());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    await expect(
      createCase({
        payload: { ...parsed.payload, subjectLocation: "OUTSIDE" },
        seniorReviewRequired: false,
        uploads: [],
      }),
    ).rejects.toThrow(/India/);
  });
});

describe("supabase admin client", () => {
  it("rejects publishable and anon keys", async () => {
    const { getServiceSupabase } = await import("../lib/supabase");
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_publishable_test";
    try {
      expect(() => getServiceSupabase()).toThrow(/service_role/);
    } finally {
      process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
      process.env.SUPABASE_URL = previousUrl;
    }
  });
});

describe("case store refusal path", () => {
  let tmp: string;
  let cwd: string;

  beforeEach(async () => {
    cwd = process.cwd();
    tmp = await mkdtemp(path.join(os.tmpdir(), "cd-cases-"));
    process.chdir(tmp);
    await mkdir(path.join(tmp, "data", "cases"), { recursive: true });
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(tmp, { recursive: true, force: true });
  });

  it("does not write a case file when the subject is not in India", async () => {
    const { createCase } = await import("../lib/cases");
    const result = validateSubmission(validInput({ subjectLocation: "OUTSIDE" }));
    expect(result.ok).toBe(false);
    if (result.ok) {
      await createCase({
        payload: result.payload,
        seniorReviewRequired: false,
        files: [],
      });
    }
    const names = await readdir(path.join(tmp, "data", "cases"));
    expect(names.filter((n) => n.endsWith(".enc"))).toEqual([]);
  });
});

describe("staff login", () => {
  const previous = {
    user: process.env.STAFF_USERNAME,
    pass: process.env.STAFF_PASSWORD,
    totp: process.env.STAFF_TOTP_SECRET,
  };

  afterEach(() => {
    process.env.STAFF_USERNAME = previous.user;
    process.env.STAFF_PASSWORD = previous.pass;
    process.env.STAFF_TOTP_SECRET = previous.totp;
  });

  it("accepts the configured username and password when TOTP is not set", async () => {
    process.env.STAFF_USERNAME = "reviewer";
    process.env.STAFF_PASSWORD = "correct-horse";
    delete process.env.STAFF_TOTP_SECRET;
    const { verifyStaff } = await import("../lib/auth");
    expect(verifyStaff("reviewer", "correct-horse")).toBe(true);
    expect(verifyStaff("reviewer", "wrong")).toBe(false);
    expect(verifyStaff("other", "correct-horse")).toBe(false);
  });

  it("is disabled when no password is configured", async () => {
    process.env.STAFF_USERNAME = "reviewer";
    delete process.env.STAFF_PASSWORD;
    delete process.env.STAFF_TOTP_SECRET;
    const { verifyStaff, isStaffLoginConfigured } = await import("../lib/auth");
    expect(isStaffLoginConfigured()).toBe(false);
    expect(verifyStaff("reviewer", "anything")).toBe(false);
  });
});

describe("staff date display", () => {
  it("formats received times in India Standard Time instead of raw ISO", async () => {
    const { formatStaffDateTime } = await import("../lib/datetime");
    const text = formatStaffDateTime("2026-08-14T15:01:13.795+00:00");
    expect(text).not.toContain("T15:01:13");
    expect(text).toMatch(/14 Aug 2026/);
    expect(text).toMatch(/8:31\s?pm/i);
  });
});
