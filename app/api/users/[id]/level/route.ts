import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { getTierForXP, getXPProgress } from "@/lib/levels"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
  if (!targetUser) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const tier = getTierForXP(targetUser.levelXP)
  const progress = getXPProgress(targetUser.levelXP)

  return NextResponse.json({
    level: targetUser.level,
    levelXP: targetUser.levelXP,
    tier: tier.tier,
    title: tier.title,
    badgeColor: tier.badgeColor,
    perks: tier.perks,
    progress,
  })
}

const LEVEL_TIERS = [
  { level: 1, xp: 0 }, { level: 2, xp: 100 }, { level: 3, xp: 500 },
  { level: 4, xp: 2000 }, { level: 5, xp: 10000 },
]

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (user.id !== params.id && user.role !== "admin") {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  const body = await req.json()
  const { xp, type } = body
  if (typeof xp !== "number" || xp <= 0) {
    return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
  }

  const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
  if (!targetUser) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const newXP = targetUser.levelXP + xp
  let newLevel = targetUser.level
  for (const tier of [...LEVEL_TIERS].reverse()) {
    if (newXP >= tier.xp) { newLevel = tier.level; break }
  }

  const created = await prisma.achievement.create({
    data: {
      userId: params.id,
      type: type || "profile_complete",
      title: `Gained ${xp} XP`,
      description: `Level ${newLevel} ${newLevel > targetUser.level ? "(level up!)" : ""}`,
      xpAwarded: xp,
    },
  })

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { levelXP: newXP, level: newLevel },
  })

  return NextResponse.json({
    user: updated,
    achievement: created,
    leveledUp: newLevel > targetUser.level,
    newLevel,
  })
}
