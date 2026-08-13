import { writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { ensureDataSubdir } from "./data-dir";

export function acknowledgementEmail(caseNumber: string): { subject: string; text: string; html: string } {
  const subject = `Your enquiry — case reference ${caseNumber}`;
  const text = [
    `Thank you for contacting us. Your case reference is ${caseNumber}. Please quote it in any correspondence.`,
    "",
    "What happens next. A senior reviewer will read your case and respond within 24 to 48 working hours, either with questions or with a written scope and a fixed fee.",
    "",
    "What this email is not. This is an acknowledgement, not an acceptance. We have not agreed to act and no fee is payable.",
    "",
    "If it is urgent. If money is at risk right now, contact your bank and report to the police or your national fraud line now. Do not wait for us.",
    "",
    "Your enquiry is held securely and is not shared outside our review team.",
  ].join("\n");

  const html = `
    <p>Thank you for contacting us. Your case reference is <strong>${caseNumber}</strong>. Please quote it in any correspondence.</p>
    <p><strong>What happens next.</strong> A senior reviewer will read your case and respond within 24 to 48 working hours, either with questions or with a written scope and a fixed fee.</p>
    <p><strong>What this email is not.</strong> This is an acknowledgement, not an acceptance. We have not agreed to act and no fee is payable.</p>
    <p><strong>If it is urgent.</strong> If money is at risk right now, contact your bank and report to the police or your national fraud line now. Do not wait for us.</p>
    <p>Your enquiry is held securely and is not shared outside our review team.</p>
  `.trim();

  return { subject, text, html };
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
    from: process.env.EMAIL_FROM || "investigations@cyberdubey.co.uk",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return { delivered: true, storedLocally: false };
}
