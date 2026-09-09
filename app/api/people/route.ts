export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, initials: true, role: true } })
  return user
}

export async function GET() {
  const currentUser = await getCurrentUserId()
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { id: true, name: true, initials: true, role: true },
    orderBy: { name: "asc" },
  })

  const usersWithConnection = await Promise.all(
    users.map(async (user) => {
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
}
