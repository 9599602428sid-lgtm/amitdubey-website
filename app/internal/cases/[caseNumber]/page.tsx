import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStaffUser } from "@/lib/auth";
import { readCase } from "@/lib/cases";

export default async function StaffCaseDetailPage({
  params,
}: {
  params: Promise<{ caseNumber: string }>;
}) {
  const user = await getStaffUser();
  if (!user) redirect("/internal/login");
  const { caseNumber } = await params;
  if (!/^CD-\d{4}-[0-9A-Z]{4}$/.test(caseNumber)) notFound();
  const record = await readCase(caseNumber);
  if (!record) notFound();

  return (
    <div className="inv-body">
      <main className="inv-main">
        <p>
          <Link href="/internal/cases">Back to cases</Link>
        </p>
        <h1 className="inv-h1">{record.caseNumber}</h1>
        <p>
          {record.status} · declaration {record.declarationVersion} · agreed {record.declarationAgreedAt}
        </p>
        {record.seniorReviewRequired ? <p className="inv-callout">Flagged for senior review.</p> : null}
        <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: "1rem", border: "1px solid #e4e0d8" }}>
          {JSON.stringify(
            {
              createdAt: record.createdAt,
              reviewDueBy: record.reviewDueBy,
              timezone: record.timezone,
              files: record.files,
              payload: record.payload,
            },
            null,
            2,
          )}
        </pre>
      </main>
    </div>
  );
}
