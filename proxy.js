import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/Student-dashboard")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/Login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Student-dashboard/:path*", "/Student-dashboard"],
};