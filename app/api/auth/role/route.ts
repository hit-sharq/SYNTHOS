import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdminUser } from "@/lib/api-auth"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ role: null })

  // Admin is env-only, so it is resolved from ADMIN_USER_IDS rather than the
  // database role. The header relies on this to render the Admin tab.
  if (isAdminUser(userId)) {
    return NextResponse.json({ role: "admin", isAdmin: true, companyId: null })
  }

  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()

  if (!email) return NextResponse.json({ role: "talent", isAdmin: false, companyId: null })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, companyId: true },
  })

  return NextResponse.json({
    role: user?.role || "talent",
    isAdmin: false,
    companyId: user?.companyId || null,
  })
}
