import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";
import { privacySections } from "@/content/legal-en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.privacy.title,
  description: copy.privacy.title,
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro title={copy.privacy.title} lead={`${copy.privacy.version}. ${copy.privacy.updated}`} />
      <div className="inv-prose">
        {privacySections().map((section) => (
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
