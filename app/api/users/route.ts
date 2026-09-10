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

  const currentUser = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  if (!currentUser) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  const isAdmin = adminIds.includes(userId)

  try {
    const where: any = {}
    if (!isAdmin) {
      where.id = currentUser.id
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        projects: true,
      },
    })

    const usersWithConnection = await Promise.all(
      users.map(async (user) => {
        if (user.id === currentUser.id) {
          return { ...user, connectionStatus: null }
        }

        const connection = await prisma.connection.findFirst({
          where: {
            OR: [
              { followerId: currentUser.id, followedId: user.id },
              { followerId: user.id, followedId: currentUser.id },
            ],
          },
          select: { status: true },
        })

        return { ...user, connectionStatus: connection?.status || null }
      })
    )

    return NextResponse.json({ users: usersWithConnection })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
