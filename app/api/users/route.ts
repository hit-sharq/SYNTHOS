import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  const isAdmin = adminIds.includes(userId)

  try {
    const where: any = {}
    if (!isAdmin) where.id = userId

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        projects: true,
        achievements: { orderBy: { createdAt: "desc" }, take: 10 },
        portfolios: true,
        spotlights: true,
        challenges: true,
        submissions: true,
        skillSwaps: true,
        connectionsSent: true,
        connectionsReceived: true,
        feedPosts: { orderBy: { createdAt: "desc" }, take: 5 },
        presence: true,
      },
    })

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
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

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials,
          role: user.role,
          level: user.level,
          levelXP: user.levelXP,
          tier,
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
          recentPosts: user.feedPosts,
          connectionStatus: user.id === userId ? null : (() => {
            const out = user.connectionsSent.find((c: any) => c.followedId === userId && c.status === "accepted")
            const inc = user.connectionsReceived.find((c: any) => c.followerId === userId && c.status === "accepted")
            if (out || inc) return "accepted"
            const pending = user.connectionsSent.find((c: any) => c.followedId === userId && c.status === "pending")
            if (pending) return "pending"
            return null
          })(),
        }
      })
    )

    return NextResponse.json({ users: usersWithDetails })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}