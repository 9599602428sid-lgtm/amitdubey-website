import Link from "next/link";
import { redirect } from "next/navigation";
import { staffLogout } from "@/app/actions/staff-auth";
import { getStaffUser } from "@/lib/auth";
import { listCases } from "@/lib/cases";

export default async function StaffCasesPage() {
  const user = await getStaffUser();
  if (!user) redirect("/internal/login");
  const cases = await listCases();

  return (
    <div className="inv-body">
      <main className="inv-main">
        <p className="inv-kicker">Signed in as {user}</p>
        <h1 className="inv-h1">Cases</h1>
        <form action={staffLogout}>
          <button className="inv-btn-secondary" type="submit">
            Sign out
          </button>
        </form>
        <p>Click a case number to open the full form answers and any uploaded files.</p>
        {cases.length === 0 ? (
          <p>No cases yet.</p>
        ) : (
          <table style={{ width: "100%", marginTop: "1.5rem", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Case</th>
                <th align="left">Status</th>
                <th align="left">Received</th>
                <th align="left">Senior review</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.caseNumber}>
                  <td>
                    <Link href={`/internal/cases/${item.caseNumber}`}>{item.caseNumber}</Link>
                  </td>
                  <td>{item.status}</td>
                  <td>{item.createdAt}</td>
                  <td>{item.seniorReviewRequired ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
