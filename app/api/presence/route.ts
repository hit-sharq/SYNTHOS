export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  return user
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { status, lastSeen } = body
  const validStatuses = ["online", "offline", "away", "do_not_disturb"]
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: Errors.validation.invalidStatus }, { status: 400 })
  }

  const presence = await prisma.presence.upsert({
    where: { userId: user.id },
    update: { status, lastActive: lastSeen ? new Date(lastSeen) : undefined },
    create: {
      userId: user.id,
      status: status || "online",
      lastActive: lastSeen ? new Date(lastSeen) : new Date(),
    },
  })

  return NextResponse.json(presence)
}
