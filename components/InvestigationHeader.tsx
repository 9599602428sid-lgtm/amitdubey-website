"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="inv-header">
      <a className="inv-skip" href="#main">
        {copy.nav.skip}
      </a>
      <div className="inv-header-inner">
        <Link className="inv-logo" href="/investigations" onClick={() => setOpen(false)}>
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
          {open ? "Close" : "Menu"}
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
          {/* Plain <a>: Next.js Link client-nav cannot serve public/*.html */}
          <a href="/" onClick={() => setOpen(false)}>
            {copy.nav.brandHome}
          </a>
        </nav>
      </div>
    </header>
  );
}
