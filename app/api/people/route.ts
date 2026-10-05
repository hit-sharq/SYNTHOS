export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { readPagination, paginated } from "@/lib/pagination"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, initials: true, role: true } })
  return user
}

export async function GET(req: Request) {
  const currentUser = await getCurrentUserId()
  if (!currentUser) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const { page, limit, skip, take } = readPagination(new URL(req.url))
  const where = { id: { not: currentUser.id } }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        initials: true,
        role: true,
        connectionsSent: {
          where: { followedId: currentUser.id },
          select: { status: true },
          take: 1,
        },
        connectionsReceived: {
          where: { followerId: currentUser.id },
          select: { status: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
      take,
      skip,
    }),
    prisma.user.count({ where }),
  ])

  const items = users.map((user) => {
    const connection = user.connectionsSent[0] ?? user.connectionsReceived[0]
    return {
      id: user.id,
      name: user.name,
      initials: user.initials,
      role: user.role,
      connectionStatus: connection?.status ?? null,
    }
  })

  return paginated(items, total, page, limit)
}
