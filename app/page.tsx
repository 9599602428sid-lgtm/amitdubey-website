import { permanentRedirect } from "next/navigation";

/** Brand homepage lives as a static HTML file in /public. */
export default function RootPage() {
  permanentRedirect("/home.html");
}
