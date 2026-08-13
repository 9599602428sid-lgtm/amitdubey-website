import type { Metadata } from "next";
import { InvestigationForm } from "@/components/InvestigationForm";
import { PageIntro } from "@/components/PageIntro";
import { getCopy } from "@/content/en";

const copy = getCopy();

export const metadata: Metadata = {
  title: copy.form.pageTitle,
  description: copy.form.pageLead,
};

export default function FileAnInvestigationPage() {
  return (
    <>
      <PageIntro title={copy.form.pageTitle} lead={copy.form.pageLead} />
      <InvestigationForm />
    </>
  );
}
