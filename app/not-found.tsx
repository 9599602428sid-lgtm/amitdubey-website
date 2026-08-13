import Link from "next/link";

export default function NotFound() {
  return (
    <div className="inv-body">
      <main className="inv-main">
        <h1 className="inv-h1">Page not found</h1>
        <p>
          <Link href="/investigations">Investigations</Link> · <Link href="/home.html">Main site</Link>
        </p>
      </main>
    </div>
  );
}
