import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export const dynamic = "force-dynamic"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      achievements: { orderBy: { createdAt: "desc" }, take: 20 },
      portfolios: { select: { id: true, title: true, slug: true, createdAt: true } },
      spotlights: { select: { id: true, title: true, createdAt: true } },
      challenges: { select: { id: true, title: true, status: true, createdAt: true } },
      submissions: { select: { id: true, challengeId: true, status: true, createdAt: true } },
      skillSwaps: { select: { id: true, title: true, status: true, createdAt: true } },
      feedPosts: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, content: true, createdAt: true } },
      presence: true,
      connectionsSent: true,
      connectionsReceived: true,
    },
  })

  if (!user) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const followerCount = user.connectionsReceived.filter(c => c.status === "accepted").length
  const followingCount = user.connectionsSent.filter(c => c.status === "accepted").length

  const tier = {
    level: user.level,
    levelXP: user.levelXP,
    title: user.level >= 5 ? "Elite" : user.level >= 4 ? "Featured" : user.level >= 3 ? "Established" : user.level >= 2 ? "Rising" : "New",
    badgeColor: user.level >= 5 ? "#0066ff" : user.level >= 4 ? "#e67e22" : user.level >= 3 ? "#27ae60" : user.level >= 2 ? "#4a90d9" : "#888888",
    perks: user.level >= 5 ? ["Elite badge", "Spotlight eligible", "API access", "Mentor program"] :
           user.level >= 4 ? ["Featured creator", "Challenge host", "Custom domain"] :
           user.level >= 3 ? ["Verified badge", "Showcase on feed", "Portfolio feature"] :
           user.level >= 2 ? ["Profile badge", "Priority search"] :
           ["Basic profile"],
  }

  const xpProgress = {
    current: user.levelXP,
    needed: tier.level >= 5 ? tier.levelXP : (
      [100, 500, 2000, 10000][tier.level - 1] || 10000
    ),
  }
  xpProgress.percent = tier.level >= 5 ? 100 : Math.min(100, Math.round((user.levelXP / xpProgress.needed) * 100))

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