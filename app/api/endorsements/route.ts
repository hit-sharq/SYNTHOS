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
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } })
  return user
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { userId: targetUserId, skill } = body
  if (!targetUserId || !skill) {
    return NextResponse.json({ error: "userId and skill required" }, { status: 400 })
  }
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot endorse yourself" }, { status: 400 })
  }

  const existing = await prisma.endorsement.findUnique({
    where: { endorserId_endorsedId_skill: { endorserId: user.id, endorsedId: targetUserId, skill } },
  })

  if (existing) {
    if (existing.endorserId === user.id) {
      return NextResponse.json({ alreadyEndorsed: true })
    }
    return NextResponse.json(existing)
  }

  const endorsement = await prisma.endorsement.create({
    data: { endorserId: user.id, endorsedId: targetUserId, skill },
  })

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { name: true } })
  if (target) {
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "New endorsement",
        message: `${user.name} endorsed your skill in ${skill}`,
        kind: "message",
        refId: endorsement.id,
      },
    })
  }

  return NextResponse.json(endorsement, { status: 201 })
}
