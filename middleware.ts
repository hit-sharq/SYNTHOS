import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { getSessionEmail } from "@/lib/auth"

const protectedPaths = [
  /^\/dashboard/,
  /^\/admin/,
  /^\/client\/dashboard/,
  /^\/company\/dashboard/,
  /^\/api\/admin/,
  /^\/api\/company/,
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedPaths.some((p) => p.test(pathname))
  if (!isProtected) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get("__session")?.value
  if (!cookie) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const email = await getSessionEmail()
  if (!email) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const response = NextResponse.next()
  response.headers.set("x-user-email", email)
  return response
}

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
