import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/Student-dashboard")) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        const loginUrl = new URL("/Login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname); // optional
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/Login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Student-dashboard/:path*","/study-room"],
};