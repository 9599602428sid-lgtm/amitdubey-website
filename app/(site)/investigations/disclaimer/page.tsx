import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.disclaimerPage.title,
  description: copy.tagline,
};

export default function DisclaimerPage() {
  return (
    <>
      <PageIntro title={copy.disclaimerPage.title} lead={copy.disclaimerPage.lead} />
      <div className="inv-prose">
        {copy.footer.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </>
  );
}
