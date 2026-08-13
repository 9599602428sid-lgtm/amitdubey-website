import Link from "next/link";
import { getCopy } from "@/content/en";

const copy = getCopy();

export function InvestigationFooter() {
  return (
    <footer className="inv-footer">
      <div className="inv-footer-inner">
        <div>
          <h2>{copy.footer.investigations}</h2>
          <p>{copy.tagline}</p>
          <p>{copy.team.line1}</p>
        </div>
        <div>
          <h2>{copy.footer.legal}</h2>
          <p>
            <Link href="/investigations/privacy">{copy.footer.links.privacy}</Link>
          </p>
          <p>
            <Link href="/investigations/terms">{copy.footer.links.terms}</Link>
          </p>
          <p>
            <Link href="/investigations/disclaimer">{copy.footer.links.disclaimer}</Link>
          </p>
          <p>
            <Link href="/investigations/complaints">{copy.footer.links.complaints}</Link>
          </p>
          <p>
            <Link href="/investigations/subject-enquiries">{copy.footer.links.subject}</Link>
          </p>
        </div>
        <div>
          <h2>{copy.nav.investigations}</h2>
          <p>
            <Link href="/investigations/what-we-will-not-do">{copy.footer.links.willNot}</Link>
          </p>
          <p>
            <Link href="/investigations/our-standards">{copy.footer.links.standards}</Link>
          </p>
          <p>
            <Link href="/file-an-investigation">{copy.nav.file}</Link>
          </p>
        </div>
      </div>
      <div className="inv-disclaimer">
        <h2 className="inv-kicker" style={{ color: "#c9c3b8" }}>
          {copy.footer.disclaimerTitle}
        </h2>
        {copy.footer.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p>{copy.footer.copyright}</p>
      </div>
    </footer>
  );
}
