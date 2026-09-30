import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ role: null })

  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()

  if (!email) return NextResponse.json({ role: "talent" })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, companyId: true },
  })

  return NextResponse.json({ role: user?.role || "talent", companyId: user?.companyId || null })
}
