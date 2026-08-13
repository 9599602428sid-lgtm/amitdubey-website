import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.complaints.title,
  description: copy.complaints.lead,
};

export default function ComplaintsPage() {
  const email = process.env.CONTACT_EMAIL || "investigations@cyberdubey.co.uk";
  return (
    <>
      <PageIntro title={copy.complaints.title} lead={copy.complaints.lead} />
      <div className="inv-prose">
        {copy.complaints.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p>
          Contact: <a href={`mailto:${email}`}>{email}</a>
        </p>
      </div>
    </>
  );
}
