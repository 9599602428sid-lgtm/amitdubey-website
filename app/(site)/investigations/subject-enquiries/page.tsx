import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SubjectEnquiryForm } from "@/components/SubjectEnquiryForm";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.subject.title,
  description: copy.subject.lead,
};

export default function SubjectEnquiriesPage() {
  const email = process.env.CONTACT_EMAIL || "investigations@cyberdubey.co.uk";
  return (
    <>
      <PageIntro title={copy.subject.title} lead={copy.subject.lead} />
      <div className="inv-prose">
        <p>{copy.subject.body}</p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>{copy.subject.formIntro}</p>
      </div>
      <SubjectEnquiryForm />
    </>
  );
}
