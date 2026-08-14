import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function decodeJwtRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getServiceSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client must not run in the browser.");
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
  if (key.startsWith("sb_publishable_") || decodeJwtRole(key) === "anon") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be the service_role secret, not a publishable or anon key.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
