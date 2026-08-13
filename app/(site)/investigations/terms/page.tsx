import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";
import { termsSections } from "@/content/legal-en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.terms.title,
  description: copy.terms.title,
};

export default function TermsPage() {
  return (
    <>
      <PageIntro title={copy.terms.title} lead={`${copy.terms.version}. ${copy.terms.updated}`} />
      <div className="inv-prose">
        {termsSections().map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
