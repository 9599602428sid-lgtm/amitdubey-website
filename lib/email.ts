import { writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { ensureDataSubdir } from "./data-dir";

const STAFF_NOTIFY_FALLBACK = "hello.siddhantsuri@gmail.com";

export function staffNotifyAddress(): string {
  return (process.env.NOTIFY_EMAIL || STAFF_NOTIFY_FALLBACK).trim();
}

export function acknowledgementEmail(caseNumber: string): { subject: string; text: string; html: string } {
  const subject = `Your case has been submitted — ${caseNumber}`;
  const text = [
    "Your investigation enquiry has been submitted.",
    "",
    `Your case number is ${caseNumber}.`,
    "",
    "Please quote this case number if you contact us. We will be in touch.",
  ].join("\n");
  const html = `
    <p>Your investigation enquiry has been submitted.</p>
    <p>Your case number is <strong>${escapeHtml(caseNumber)}</strong>.</p>
    <p>Please quote this case number if you contact us. We will be in touch.</p>
  `.trim();
  return { subject, text, html };
}

export function staffNewCaseEmail(caseNumber: string): { subject: string; text: string; html: string } {
  const subject = `New case received — ${caseNumber}`;
  const text = [
    "A new File an Investigation enquiry has been received.",
    "",
    `Case number: ${caseNumber}`,
    "",
    "Sign in at /internal/login to review it. This message does not contain the enquiry details.",
  ].join("\n");
  const html = `
    <p>A new File an Investigation enquiry has been received.</p>
    <p>Case number: <strong>${escapeHtml(caseNumber)}</strong></p>
    <p>Sign in at /internal/login to review it. This message does not contain the enquiry details.</p>
  `.trim();
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function writeLocalMail(to: string, subject: string, text: string) {
  try {
    const dir = await ensureDataSubdir("mail");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await writeFile(path.join(dir, `${stamp}.txt`), `To: ${to}\nSubject: ${subject}\n\n${text}`);
  } catch (error) {
    console.warn("Could not write local mail copy", error);
  }
}

export async function sendMail(options: { to: string; subject: string; text: string; html: string }) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    await writeLocalMail(options.to, options.subject, options.text);
    return { delivered: false, storedLocally: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Investigations <investigations@cyberdubey.co.uk>",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return { delivered: true, storedLocally: false };
}
