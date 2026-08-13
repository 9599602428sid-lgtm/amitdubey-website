import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.howItWorks.title,
  description: copy.howItWorks.lead,
};

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro title={copy.howItWorks.title} lead={copy.howItWorks.lead} />
      <div className="inv-prose">
        {copy.howItWorks.steps.map((step) => (
          <section key={step.title}>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </section>
        ))}
        <p>
          <Link className="inv-btn" href="/file-an-investigation">
            {copy.nav.file}
          </Link>
        </p>
      </div>
    </>
  );
}
