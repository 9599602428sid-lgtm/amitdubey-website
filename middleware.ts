import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/internal")) return NextResponse.next();

  if (pathname !== "/internal/login") {
    const user = await readSession(request.cookies.get("cd_staff")?.value);
    if (!user) {
      const login = NextResponse.redirect(new URL("/internal/login", request.url));
      Object.entries(NO_STORE).forEach(([key, value]) => login.headers.set(key, value));
      return login;
    }
  }

  const response = NextResponse.next();
  Object.entries(NO_STORE).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/internal", "/internal/:path*"],
};
