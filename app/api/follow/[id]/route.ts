import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export const dynamic = "force-dynamic"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (user.id === params.id) return NextResponse.json({ error: Errors.actions.cannotFollowSelf }, { status: 400 })

  const talent = await prisma.talent.findUnique({ where: { id: params.id } })
  if (!talent) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const existing = await prisma.connection.findUnique({
    where: { followerId_followedId: { followerId: user.id, followedId: talent.userId || params.id } },
  })

  if (existing) {
    if (existing.status === "accepted") {
      await prisma.connection.delete({ where: { id: existing.id } })
      return NextResponse.json({ followed: false })
    }
    await prisma.connection.update({
      where: { id: existing.id },
      data: { status: "accepted" },
    })
    return NextResponse.json({ followed: true })
  }

  await prisma.connection.create({
    data: { followerId: user.id, followedId: talent.userId || params.id, status: "accepted" },
  })

  return NextResponse.json({ followed: true })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const talent = await prisma.talent.findUnique({ where: { id: params.id } })
  if (!talent) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const followed = await prisma.connection.findFirst({
    where: { followerId: user.id, followedId: talent.userId || params.id, status: "accepted" },
  })

  const followerCount = await prisma.connection.count({
    where: { followedId: talent.userId || params.id, status: "accepted" },
  })

  const followingCount = await prisma.connection.count({
    where: { followerId: user.id, status: "accepted" },
  })

  return NextResponse.json({
    followed: !!followed,
    followerCount,
    followingCount,
  })
}