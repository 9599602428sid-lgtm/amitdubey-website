"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearStaffCookie, setStaffCookie, verifyStaff } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function staffLogin(formData: FormData) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const limit = await checkRateLimit(`staff-login:${ip}`);
  if (!limit.ok) {
    redirect("/internal/login?error=1");
  }

  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const totp = String(formData.get("totp") || "");
  if (!verifyStaff(username, password, totp)) {
    redirect("/internal/login?error=1");
  }
  await setStaffCookie(username);
  redirect("/internal/cases");
}

export async function staffLogout() {
  await clearStaffCookie();
  redirect("/internal/login");
}
