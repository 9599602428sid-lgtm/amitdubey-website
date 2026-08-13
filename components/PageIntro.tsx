import { getCopy } from "@/content/en";

export function PageIntro({
  kicker,
  title,
  lead,
}: {
  kicker?: string;
  title: string;
  lead?: string;
}) {
  const copy = getCopy();
  return (
    <header>
      <p className="inv-kicker">{kicker || copy.tagline}</p>
      <h1 className="inv-h1">{title}</h1>
      {lead ? <p className="inv-lead">{lead}</p> : null}
    </header>
  );
}
