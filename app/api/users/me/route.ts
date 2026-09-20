import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { LEVEL_TIERS } from "@/lib/levels"

export const dynamic = "force-dynamic"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      achievements: { orderBy: { createdAt: "desc" }, take: 20 },
      portfolios: { select: { id: true, title: true, slug: true, createdAt: true } },
      spotlights: { select: { id: true, title: true, createdAt: true } },
      challenges: { select: { id: true, title: true, status: true, createdAt: true } },
      submissions: { select: { id: true, challengeId: true, status: true, createdAt: true } },
      skillSwaps: { select: { id: true, offerSkill: true, wantSkill: true, status: true, createdAt: true } },
      feedPosts: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, content: true, createdAt: true } },
      presence: true,
      connectionsSent: true,
      connectionsReceived: true,
    },
  })

  if (!user) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const followerCount = user.connectionsReceived.filter(c => c.status === "accepted").length
  const followingCount = user.connectionsSent.filter(c => c.status === "accepted").length

  const tierInfo = LEVEL_TIERS.find(t => t.level === user.level) || LEVEL_TIERS[0]

  const tier = {
    level: user.level,
    levelXP: user.levelXP,
    xpRequired: tierInfo.xpRequired,
    title: tierInfo.title,
    badgeColor: tierInfo.badgeColor,
    perks: tierInfo.perks,
  }

  const currentTierIdx = LEVEL_TIERS.findIndex(t => t.level === tier.level)
  const nextTier = currentTierIdx < LEVEL_TIERS.length - 1 ? LEVEL_TIERS[currentTierIdx + 1] : null
  const xpProgress = nextTier
    ? {
        current: user.levelXP - tier.xpRequired,
        needed: nextTier.xpRequired - tier.xpRequired,
        percent: Math.min(100, Math.round(((user.levelXP - tier.xpRequired) / (nextTier.xpRequired - tier.xpRequired)) * 100)),
      }
    : { current: user.levelXP, needed: tier.levelXP, percent: 100 }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials,
    role: user.role,
    level: user.level,
    levelXP: user.levelXP,
    tier,
    xpProgress,
    presence: user.presence,
    stats: {
      portfolios: user.portfolios.length,
      spotlights: user.spotlights.length,
      challenges: user.challenges.length,
      submissions: user.submissions.length,
      skillSwaps: user.skillSwaps.length,
      followers: followerCount,
      following: followingCount,
      achievements: user.achievements.length,
    },
    achievements: user.achievements,
    portfolios: user.portfolios,
    spotlights: user.spotlights,
    challenges: user.challenges,
    submissions: user.submissions,
    skillSwaps: user.skillSwaps,
    recentPosts: user.feedPosts,
  })
}