import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { status: newStatus } = body
  const validStatuses = ["pending", "accepted", "declined"]
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: Errors.validation.invalidStatus }, { status: 400 })
  }

  const connection = await prisma.connection.findUnique({
    where: { id: params.id },
  })

  if (!connection) return NextResponse.json({ error: Errors.resources.connectionNotFound }, { status: 404 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (connection.followedId !== user.id && connection.followerId !== user.id && !adminIds.includes(user.id)) {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  if (connection.followedId === user.id && newStatus === "accepted") {
    await prisma.notification.create({
      data: {
        userId: connection.followerId,
        title: "Connection accepted",
        message: `${user.name} accepted your connection request`,
        kind: "message",
        refId: connection.id,
      },
    })
  }

  const updated = await prisma.connection.update({
    where: { id: params.id },
    data: { status: newStatus },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const connection = await prisma.connection.findUnique({ where: { id: params.id } })
  if (!connection) return NextResponse.json({ error: Errors.resources.connectionNotFound }, { status: 404 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (connection.followerId !== user.id && connection.followedId !== user.id && !adminIds.includes(user.id)) {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  await prisma.connection.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
