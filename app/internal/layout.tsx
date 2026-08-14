import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
