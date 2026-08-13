import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.standards.title,
  description: copy.standards.lead,
};

export default function OurStandardsPage() {
  return (
    <>
      <PageIntro title={copy.standards.title} lead={copy.standards.lead} />
      <div className="inv-prose">
        {copy.standards.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
