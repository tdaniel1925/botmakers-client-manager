// TEMPORARILY DISABLED FOR VERCEL DEPLOYMENT TESTING
// import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Bypass authentication for testing
export default function middleware(req: NextRequest) {
  // Add pathname to headers so we can access it in server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// ORIGINAL WITH AUTH (re-enable after fixing Clerk domain):
// export default clerkMiddleware((auth, req) => {
//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set("x-pathname", req.nextUrl.pathname);
//   
//   return NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });
// });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
