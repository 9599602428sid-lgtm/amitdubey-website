import type { Metadata } from "next";
import { staffLogin } from "@/app/actions/staff-auth";
import { isStaffLoginConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Staff review" };

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = isStaffLoginConfigured();
  const totpRequired = Boolean(process.env.STAFF_TOTP_SECRET);
  return (
    <div className="inv-body">
      <main className="inv-main" style={{ maxWidth: 480 }}>
        <h1 className="inv-h1">Staff review</h1>
        <p className="inv-lead">Sign in with the username and password you were given to view filed investigations.</p>
        {!configured ? (
          <p className="inv-callout">Staff login is not configured. Set STAFF_PASSWORD.</p>
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
            {totpRequired ? (
              <div className="inv-field">
                <label htmlFor="totp">Authenticator code</label>
                <input id="totp" name="totp" inputMode="numeric" autoComplete="one-time-code" required />
              </div>
            ) : null}
            <button className="inv-btn" type="submit">
              Sign in
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
