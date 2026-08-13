"use server";

import { sendMail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function submitSubjectEnquiry(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await checkRateLimit(`subject:${ip}`);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please wait and try again." };

  if (String(formData.get("website") || "").trim()) {
    return { ok: false, message: "Unable to accept this submission." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email || message.length < 20) {
    return { ok: false, message: "Please complete your name, email, and a short description of your concern." };
  }

  const notify = process.env.NOTIFY_EMAIL || process.env.CONTACT_EMAIL || "investigations@cyberdubey.co.uk";
  await sendMail({
    to: notify,
    subject: "Subject enquiry",
    text: `A subject enquiry was submitted.\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p>A subject enquiry was submitted.</p><p>Name: ${name}<br>Email: ${email}</p><p>${message.replace(/</g, "&lt;")}</p>`,
  });

  return { ok: true, message: "Thank you. We will respond within five working days, India Standard Time." };
}
