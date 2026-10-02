import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

const protectedPaths = [
  /^\/dashboard/,
  /^\/admin/,
  /^\/client\/dashboard/,
  /^\/company\/dashboard/,
  /^\/company\/jobs/,
  /^\/company\/applications/,
  /^\/company\/profile/,
  /^\/company\/verification/,
  /^\/api\/admin/,
  // Signup and login create the account, so they must stay reachable without
  // a session. Everything else under /api/company requires one.
  /^\/api\/company\/(?!signup$|login$)/,
  /^\/api\/talent\//,
  /^\/api\/feed/,
  /^\/api\/connections/,
  /^\/api\/reactions/,
  /^\/api\/comments/,
  /^\/api\/endorsements/,
  /^\/api\/presence/,
  /^\/api\/workplaces/,
  /^\/api\/people/,
]

/**
 * Clerk's middleware verifies the session token and populates the request
 * context, which is what makes `auth()` work inside route handlers. The
 * handler below layers this app's own path protection on top of it.
 */
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  const isProtected = protectedPaths.some((p) => p.test(pathname))
  if (!isProtected) {
    return NextResponse.next()
  }

  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matchers: [
    { skip: true, source: "/sign-in(.*)" },
    { skip: true, source: "/sign-up(.*)" },
    { skip: true, source: "/api/webhooks(.*)" },
    {
      matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
    },
    {
      matcher: ["/(api|trpc)(.*)"],
    },
  ],
}
