"use server";

import { headers } from "next/headers";
import { createCase, hashSubmitterIp, type PendingUpload } from "@/lib/cases";
import { acknowledgementEmail, sendMail, staffNewCaseEmail, staffNotifyAddress } from "@/lib/email";
import { detectAllowedFile, mimeFor, virusScan } from "@/lib/files";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_FILES } from "@/lib/constants";
import { validateFiles, validateSubmission } from "@/lib/validation";

export type SubmitOk = { ok: true; caseNumber: string; status: string };
export type SubmitErr = {
  ok: false;
  code: "NOT_INDIA" | "INVALID" | "BOT" | "RATE" | "UPLOAD" | "ERROR";
  message: string;
  issues?: { field: string; message: string }[];
};
export type SubmitResult = SubmitOk | SubmitErr;

function formRecord(formData: FormData): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}

export async function submitInvestigation(formData: FormData): Promise<SubmitResult> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "unknown";

    const limit = await checkRateLimit(ip);
    if (!limit.ok) {
      return { ok: false, code: "RATE", message: "Too many attempts. Please wait and try again." };
    }

    const parsed = validateSubmission(formRecord(formData));
    if (!parsed.ok) {
      return {
        ok: false,
        code: parsed.code,
        message: parsed.message,
        issues: parsed.issues,
      };
    }

    const incoming = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    const fileIssues = validateFiles(incoming.map((f) => ({ name: f.name, type: f.type, size: f.size })));
    if (fileIssues.length) {
      return { ok: false, code: "UPLOAD", message: fileIssues[0].message, issues: fileIssues };
    }
    if (incoming.length > MAX_FILES) {
      return { ok: false, code: "UPLOAD", message: `You can upload at most ${MAX_FILES} files.` };
    }

    const uploads: PendingUpload[] = [];
    for (const file of incoming) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const kind = detectAllowedFile(file.name, bytes);
      if (!kind) {
        return {
          ok: false,
          code: "UPLOAD",
          message: `${file.name} is not an accepted file type. Use PDF, JPG, PNG or DOCX.`,
        };
      }
      const scan = await virusScan(bytes);
      if (!scan.clean) {
        return { ok: false, code: "UPLOAD", message: scan.reason || "A file failed the security check." };
      }
      uploads.push({
        originalName: file.name,
        mimeType: mimeFor(kind),
        bytes,
      });
    }

    const record = await createCase({
      payload: parsed.payload,
      seniorReviewRequired: parsed.seniorReviewRequired,
      uploads,
      submitterIpHash: hashSubmitterIp(ip),
    });

    const clientMail = acknowledgementEmail(record.caseNumber);
    const staffMail = staffNewCaseEmail(record.caseNumber);
    try {
      await sendMail({ to: parsed.payload.email, ...clientMail });
    } catch (mailError) {
      console.error("acknowledgement email failed", mailError);
    }
    try {
      await sendMail({ to: staffNotifyAddress(), ...staffMail });
    } catch (mailError) {
      console.error("staff notification email failed", mailError);
    }

    return { ok: true, caseNumber: record.caseNumber, status: record.status };
  } catch (error) {
    console.error("submitInvestigation failed", error);
    return { ok: false, code: "ERROR", message: "We could not submit the enquiry. Please try again." };
  }
}
