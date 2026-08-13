import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.faq.title,
  description: copy.faq.lead,
};

export default function FaqPage() {
  return (
    <>
      <PageIntro title={copy.faq.title} lead={copy.faq.lead} />
      <div className="inv-faq inv-prose">
        {copy.faq.items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
