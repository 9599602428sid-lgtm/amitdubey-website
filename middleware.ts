import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/internal") && pathname !== "/internal/login") {
    const user = await readSession(request.cookies.get("cd_staff")?.value);
    if (!user) {
      return NextResponse.redirect(new URL("/internal/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*"],
};
