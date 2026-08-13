import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";
import { COVERAGE_CITIES, INDIA_STATES } from "@/lib/constants";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.coverage.title,
  description: copy.coverage.lead,
};

export default function CoveragePage() {
  return (
    <>
      <PageIntro title={copy.coverage.title} lead={copy.coverage.lead} />
      <div className="inv-prose">
        <p>{copy.coverage.intro}</p>
        <p>{copy.coverage.note}</p>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        {INDIA_STATES.map((state) => (
          <section className="inv-state-block" key={state}>
            <h3>{state}</h3>
            <p>
              {COVERAGE_CITIES[state]?.length
                ? `Field verification routinely available in ${COVERAGE_CITIES[state].join(", ")}. Other locations on request.`
                : "Field verification available across the state or union territory. Tell us the city on the form."}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
