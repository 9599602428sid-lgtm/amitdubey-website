"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FileInvestigationButton } from "@/components/FileInvestigationButton";
import { InvestigationFooter } from "@/components/InvestigationFooter";
import { InvestigationHeader } from "@/components/InvestigationHeader";

function ChromeInner({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const embed = params.get("embed") === "1";
  const onForm = pathname === "/file-an-investigation";

  if (embed) {
    return (
      <div className="inv-body inv-embed">
        <main className="inv-main" id="main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="inv-body">
      <InvestigationHeader />
      <main className="inv-main" id="main">
        {children}
      </main>
      <InvestigationFooter />
      <FileInvestigationButton hideOnFormPage={onForm} />
    </div>
  );
}

export function InvestigationChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="inv-body">
          <main className="inv-main">{children}</main>
        </div>
      }
    >
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}
