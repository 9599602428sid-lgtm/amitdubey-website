import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.willNot.title,
  description: copy.willNot.lead,
};

export default function WhatWeWillNotDoPage() {
  return (
    <>
      <PageIntro title={copy.willNot.title} lead={copy.willNot.lead} />
      <div className="inv-prose">
        <ul>
          {copy.willNot.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
