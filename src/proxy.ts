import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    if (req.nextUrl.pathname.startsWith("/login") && req.nextauth.token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return String(token?.role).toLowerCase() === "admin";
        }

        return true;
      },
    },
    pages: { signIn: "/" },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
