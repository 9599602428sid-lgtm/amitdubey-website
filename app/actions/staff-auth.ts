"use server";

import { redirect } from "next/navigation";
import { clearStaffCookie, setStaffCookie, verifyStaff } from "@/lib/auth";

export async function staffLogin(formData: FormData) {
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
