import type { Metadata } from "next";
import { staffLogin } from "@/app/actions/staff-auth";

export const metadata: Metadata = { title: "Staff review" };

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = Boolean(process.env.STAFF_PASSWORD && process.env.STAFF_TOTP_SECRET);
  return (
    <div className="inv-body">
      <main className="inv-main" style={{ maxWidth: 480 }}>
        <h1 className="inv-h1">Staff review</h1>
        <p className="inv-lead">Two-factor authentication is required on every internal account.</p>
        {!configured ? (
          <p className="inv-callout">Staff login is not configured. Set STAFF_PASSWORD and STAFF_TOTP_SECRET.</p>
        ) : (
          <form action={staffLogin} className="inv-form">
            {params.error ? <p className="inv-error">Those details were not accepted.</p> : null}
            <div className="inv-field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" autoComplete="username" required />
            </div>
            <div className="inv-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <div className="inv-field">
              <label htmlFor="totp">Authenticator code</label>
              <input id="totp" name="totp" inputMode="numeric" autoComplete="one-time-code" required />
            </div>
            <button className="inv-btn" type="submit">
              Sign in
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
