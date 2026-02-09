import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("=== Middleware ===");
    console.log("Path:", path);
    console.log("Has token:", !!token);
    console.log("Backend verified:", token?.['backendVerified']);
    console.log("Is new user:", token?.['isNewUser']);
    console.log("Needs preferences:", token?.['needsPreferences']);
    console.log("Access token expires:", token?.['accessTokenExpires']);

    if (token?.['accessTokenExpires'] && Date.now() >= Number(token['accessTokenExpires'])) {
      console.log("Blocking access - access token expired");
      return NextResponse.redirect(new URL("/login?error=token_expired", req.url));
    }

    // If user is not verified with backend, redirect to login
    if (!token?.['backendVerified']) {
      console.log("Blocking access - backend not verified");
      return NextResponse.redirect(new URL("/login?error=backend_verification_failed", req.url));
    }

    // If user is on onboarding page and already completed it, redirect to dashboard
    if (path === "/onboarding" && !token?.['isNewUser'] && !token?.['needsPreferences']) {
      console.log("Redirecting to dashboard - onboarding already completed");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is new or needs preferences and NOT on onboarding page, redirect to onboarding
    if (path !== "/onboarding" && (token?.['isNewUser'] || token?.['needsPreferences'])) {
      console.log("Redirecting to onboarding - user needs to complete setup");
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Allow access
    console.log("Access granted");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User must have a token to access protected routes
        return !!token;
      },
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/discover/:path*",
    "/forums/:path*",
    "/chat/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/onboarding",
  ],
};
