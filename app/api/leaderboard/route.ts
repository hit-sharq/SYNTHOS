import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const tiers = [
    { level: 1, title: "New", badgeColor: "#888888", xpRequired: 0 },
    { level: 2, title: "Rising", badgeColor: "#4a90d9", xpRequired: 100 },
    { level: 3, title: "Established", badgeColor: "#27ae60", xpRequired: 500 },
    { level: 4, title: "Featured", badgeColor: "#e67e22", xpRequired: 2000 },
    { level: 5, title: "Elite", badgeColor: "#0066ff", xpRequired: 10000 },
  ]

  const top = await prisma.user.findMany({
    where: { level: { gte: 4 } },
    orderBy: { levelXP: "desc" },
    take: 10,
    select: { id: true, name: true, initials: true, level: true, levelXP: true },
    include: { talentProfile: { select: { id: true } } },
  })

  return NextResponse.json({
    tiers,
    top: top.map(u => ({
      id: u.id,
      name: u.name,
      initials: u.initials,
      level: u.level,
      levelXP: u.levelXP,
      talentId: u.talentProfile?.id || null,
    })),
  })
}
