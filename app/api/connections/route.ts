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

export async function GET(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "accepted"

  const where: any = {}
  if (status === "all") {
    where.OR = [{ followerId: user.id }, { followedId: user.id }]
  } else if (status === "pending") {
    where.followerId = user.id
    where.status = "pending"
  } else if (status === "incoming") {
    where.followedId = user.id
    where.status = "pending"
  } else {
    where.OR = [
      { followerId: user.id, status: "accepted" },
      { followedId: user.id, status: "accepted" },
    ]
  }

  const connections = await prisma.connection.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      follower: { select: { id: true, name: true, initials: true, role: true } },
      followed: { select: { id: true, name: true, initials: true, role: true } },
    },
  })

  const result = connections.map(c => {
    const isConnected = c.followerId === user.id ? c.followed : c.follower
    const isMe = c.followerId === user.id ? "follower" : "followed"
    return {
      id: c.id,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      connectedUser: isMe === "follower" ? c.followed : c.follower,
      direction: isMe,
    }
  })

  return NextResponse.json({ connections: result })
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { followedId } = body
  if (!followedId) return NextResponse.json({ error: "followedId required" }, { status: 400 })
  if (followedId === user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })

  const existing = await prisma.connection.findUnique({
    where: { followerId_followedId: { followerId: user.id, followedId } },
  })

  if (existing) {
    if (existing.status === "declined") {
      const updated = await prisma.connection.update({
        where: { followerId_followedId: { followerId: user.id, followedId } },
        data: { status: "pending" },
      })
      return NextResponse.json(updated)
    }
    return NextResponse.json(existing)
  }

  const connection = await prisma.connection.create({
    data: { followerId: user.id, followedId },
  })

  const followed = await prisma.user.findUnique({ where: { id: followedId }, select: { name: true } })
  await prisma.notification.create({
    data: {
      userId: followedId,
      title: "New connection request",
      message: `${user.name} wants to connect with you`,
      kind: "message",
      refId: connection.id,
    },
  })

  return NextResponse.json(connection, { status: 201 })
}
