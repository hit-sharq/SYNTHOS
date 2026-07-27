import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
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
