import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStaffUser } from "@/lib/auth";
import { readCase } from "@/lib/cases";
import {
  CATEGORIES,
  DECLARATIONS,
  PREFERRED_CONTACT,
  URGENCY_OPTIONS,
  WORKING_TIMEZONE,
} from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { getCopy } from "@/content/en";

const copy = getCopy();

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: WORKING_TIMEZONE,
  }).format(new Date(iso));
}

function yesNo(value: string): string {
  if (value === "yes") return copy.form.yes;
  if (value === "no") return copy.form.no;
  if (value === "not_yet") return copy.form.notYet;
  return value || "—";
}

function countryName(code: string): string {
  return COUNTRIES.find((item) => item.code === code)?.name || code || "—";
}

function categoryLabel(id: string): string {
  return CATEGORIES.find((item) => item.id === id)?.label || id || "—";
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="inv-review-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

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

  const { payload } = record;
  const phone = [payload.phoneCountry, payload.phoneNumber].filter(Boolean).join(" ");

  return (
    <div className="inv-body">
      <main className="inv-main">
        <p>
          <Link href="/internal/cases">Back to cases</Link>
        </p>
        <p className="inv-kicker">{record.status}</p>
        <h1 className="inv-h1">{record.caseNumber}</h1>
        <p>
          Received {formatWhen(record.createdAt)} ({WORKING_TIMEZONE}). Review due by{" "}
          {formatWhen(record.reviewDueBy)}.
        </p>
        {record.seniorReviewRequired ? <p className="inv-callout">Flagged for senior review.</p> : null}

        <section className="inv-review">
          <h2 className="inv-legend">{copy.form.step1Title}</h2>
          <dl>
            <Field label={copy.form.subjectLocation} value={payload.subjectLocation === "IN" ? copy.form.subjectIndia : payload.subjectLocation} />
            <Field label={copy.form.clientCountry} value={countryName(payload.clientCountry)} />
            <Field label={copy.form.category} value={categoryLabel(payload.category)} />
            <Field label={copy.form.subcategory} value={payload.subcategory} />
            <Field label={copy.form.indiaState} value={payload.indiaState} />
            <Field label={copy.form.indiaCity} value={payload.indiaCity} />
            <Field
              label={copy.form.urgency}
              value={URGENCY_OPTIONS.find((item) => item.id === payload.urgency)?.label || payload.urgency}
            />
            <Field label={copy.form.moneyAtRisk} value={yesNo(payload.moneyAtRisk)} />
          </dl>
        </section>

        <section className="inv-review">
          <h2 className="inv-legend">{copy.form.step2Title}</h2>
          <dl>
            <Field label={copy.form.fullName} value={payload.fullName} />
            <Field label={copy.form.email} value={payload.email} />
            <Field label={copy.form.phone} value={phone} />
            <Field
              label={copy.form.preferredContact}
              value={PREFERRED_CONTACT.find((item) => item.id === payload.preferredContact)?.label || payload.preferredContact}
            />
            <Field label={copy.form.clientCity} value={payload.clientCity} />
            <Field
              label={copy.form.clientType}
              value={payload.clientType === "organisation" ? copy.form.organisation : payload.clientType === "individual" ? copy.form.individual : payload.clientType}
            />
            <Field label={copy.form.organisationName} value={payload.organisationName} />
            <Field label={copy.form.organisationRole} value={payload.organisationRole} />
          </dl>
        </section>

        <section className="inv-review">
          <h2 className="inv-legend">{copy.form.step3Title}</h2>
          <dl>
            <Field label={copy.form.establish} value={payload.establish} />
            <Field label={copy.form.relationship} value={payload.relationship} />
            <Field label={copy.form.relationshipOther} value={payload.relationshipOther} />
            <Field label={copy.form.purpose} value={payload.purpose} />
            <Field label={copy.form.adverseDecision} value={yesNo(payload.adverseDecision)} />
            <Field label={copy.form.reported} value={yesNo(payload.reportedAuthorities)} />
            <Field label={copy.form.courtCase} value={yesNo(payload.courtCase)} />
            <Field label={copy.form.valueAtRisk} value={payload.valueAtRisk} />
          </dl>
        </section>

        <section className="inv-review">
          <h2 className="inv-legend">{copy.form.uploads}</h2>
          {record.files.length === 0 ? (
            <p>No documents were uploaded with this enquiry.</p>
          ) : (
            <ul className="inv-file-list">
              {record.files.map((file) => {
                const href = `/internal/cases/${record.caseNumber}/files/${file.id}`;
                const image = file.mimeType.startsWith("image/");
                return (
                  <li key={file.id} className="inv-file-card">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${href}?inline=1`} alt={file.originalName} />
                    ) : null}
                    <p>
                      <a href={href}>{file.originalName}</a>
                      <span className="inv-hint">
                        {" "}
                        ({file.mimeType}, {Math.ceil(file.size / 1024)} KB)
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="inv-review">
          <h2 className="inv-legend">{copy.form.step4Title}</h2>
          <p className="inv-hint">
            Declaration {record.declarationVersion}, agreed {formatWhen(record.declarationAgreedAt)}.
          </p>
          <ul>
            {DECLARATIONS.map((item) => (
              <li key={item.id}>
                {payload.declarations[item.id] ? "Confirmed" : "Not confirmed"} — {item.text}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
