import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();
const page = copy.categories.personal;

export const metadata: Metadata = { title: page.title, description: page.lead };

export default function PersonalFamilyPage() {
  return (
    <>
      <PageIntro title={page.title} lead={page.lead} />
      <div className="inv-prose">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
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
