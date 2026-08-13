import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: "Investigations",
  description: copy.tagline,
};

export default function InvestigationsLandingPage() {
  return (
    <>
      <PageIntro title={copy.landing.title} lead={copy.landing.lead} />
      <p className="inv-prose">{copy.landing.intro}</p>
      <p className="inv-prose">{copy.team.line1}</p>
      <p className="inv-prose">{copy.team.line2}</p>
      <p className="inv-prose">{copy.team.line3}</p>

      <div className="inv-quote">
        <h2>{copy.landing.quoteTitle}</h2>
        <p>{copy.landing.quote}</p>
      </div>

      <h2 className="inv-h1" style={{ fontSize: "1.6rem" }}>
        {copy.landing.categoriesTitle}
      </h2>
      <div className="inv-grid-4">
        <article className="inv-card">
          <h3>
            <Link className="stretched" href="/investigations/personal-family">
              {copy.categories.personal.nav}
            </Link>
          </h3>
          <p>{copy.categories.personal.lead}</p>
        </article>
        <article className="inv-card">
          <h3>
            <Link className="stretched" href="/investigations/business-commercial">
              {copy.categories.business.nav}
            </Link>
          </h3>
          <p>{copy.categories.business.lead}</p>
        </article>
        <article className="inv-card">
          <h3>
            <Link className="stretched" href="/investigations/cyber-digital">
              {copy.categories.cyber.nav}
            </Link>
          </h3>
          <p>{copy.categories.cyber.lead}</p>
        </article>
        <article className="inv-card">
          <h3>
            <Link className="stretched" href="/investigations/legal-support">
              {copy.categories.legal.nav}
            </Link>
          </h3>
          <p>{copy.categories.legal.lead}</p>
        </article>
      </div>

      <h2 className="inv-h1" style={{ fontSize: "1.6rem", marginTop: "2.5rem" }}>
        {copy.landing.stepsTitle}
      </h2>
      <ol className="inv-steps">
        {copy.landing.steps.map((step, index) => (
          <li className="inv-card" key={step.title}>
            <h3>
              {index + 1}. {step.title}
            </h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="inv-lead" style={{ marginTop: "2rem" }}>
        {copy.landing.notIndiaNote}
      </p>
      <p>
        <Link className="inv-btn" href="/file-an-investigation">
          {copy.landing.cta}
        </Link>
      </p>
    </>
  );
}
