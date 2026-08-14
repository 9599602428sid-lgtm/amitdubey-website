import type { Metadata } from "next";
import { InvestigationForm } from "@/components/InvestigationForm";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.form.pageTitle,
  description: copy.form.pageLead,
};

export default async function FileAnInvestigationPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const embed = (await searchParams).embed === "1";
  return (
    <>
      {embed ? null : <PageIntro title={copy.form.pageTitle} lead={copy.form.pageLead} />}
      <InvestigationForm />
    </>
  );
}
