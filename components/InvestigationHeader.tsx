"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getCopy } from "@/content/en";

const copy = getCopy();

const links = [
  { href: "/investigations", label: copy.nav.investigations },
  { href: "/investigations/how-it-works", label: copy.nav.howItWorks },
  { href: "/investigations/coverage", label: copy.nav.coverage },
  { href: "/investigations/our-standards", label: copy.nav.standards },
  { href: "/investigations/what-we-will-not-do", label: copy.nav.willNot },
  { href: "/investigations/faq", label: copy.nav.faq },
];

export function InvestigationHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="inv-header">
      <a className="inv-skip" href="#main">
        {copy.nav.skip}
      </a>
      <div className="inv-header-inner">
        <Link className="inv-logo" href="/investigations">
          AMIT DUBEY
          <span>Investigations</span>
        </Link>
        <button
          type="button"
          className="inv-nav-toggle"
          aria-expanded={open}
          aria-controls="inv-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <nav className="inv-nav" id="inv-nav" data-open={open} aria-label="Investigations">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/home.html">{copy.nav.brandHome}</Link>
        </nav>
      </div>
    </header>
  );
}
